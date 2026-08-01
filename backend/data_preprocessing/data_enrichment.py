"""Generate natural-language "vibes" per product with the Gemini API.

Batched, with exponential backoff and per-batch CSV appends so a crash doesn't
lose completed work.

Usage:
  python data_enrichment.py --input ./processed/processed_menswear.csv --output ./processed/enriched_menswear.csv --start 0 --end 100 --batch-size 10
"""

import argparse
import json
import os
import time
import random
from typing import Tuple

import pandas as pd
import google.generativeai as genai
from decouple import config

API_KEY = config("GEMINI_API_KEY")
genai.configure(api_key=API_KEY)

# Fast and cheap; the task is high-volume but structurally simple.
MODEL_NAME = 'gemini-3.1-flash-lite'


def generate_with_backoff(prompt: str, max_retries: int = 5, base_delay: float = 2.0):
    """Call Gemini, backing off exponentially on rate limits (429) and
    transient server errors (503).
    """
    for attempt in range(max_retries):
        try:
            response = model.generate_content(
                prompt,
                generation_config=genai.types.GenerationConfig(
                    temperature=0.2,
                    response_mime_type="application/json",
                )
            )
            return response

        except Exception as e:
            error_msg = str(e).lower()

            if any(keyword in error_msg for keyword in ["429", "quota", "exhausted", "503", "unavailable"]):
                if attempt == max_retries - 1:
                    print(f"\n[!] Max retries reached. API Error: {e}")
                    raise e

                wait_time = (base_delay * (2 ** attempt)) + random.uniform(0, 1)
                print(f"\n[!] Rate limit/Server error hit. Retrying in {wait_time:.1f}s (Attempt {attempt + 2}/{max_retries})...")
                time.sleep(wait_time)
            else:
                # Unrecoverable (e.g. 400 Bad Request) - don't retry.
                print(f"\n[!] Unrecoverable API Error: {e}")
                raise e


def process_batch(batch_df: pd.DataFrame) -> Tuple[pd.DataFrame, bool]:
    """Send a batch of rows to the API and merge the returned vibes back in.

    Returns ``(dataframe, succeeded)``.
    """
    products_for_prompt = []
    for idx, row in batch_df.iterrows():
        products_for_prompt.append({
            "id": idx,
            "name": str(row.get('prod_name', '')),
            "description": str(row.get('detail_desc', '')),
            "color": str(row.get('graphical_appearance_name', '')) +
                     str(row.get('perceived_colour_value_name', '')) +
                     str(row.get('perceived_colour_master_name', ''))
        })

    prompt = f"""
        You are an expert in e-commerce semantic search and consumer psychology.
        I am providing a JSON array of clothing products. For each product, generate exactly 3 distinct, natural-language search queries (or "vibes") a real user would type when looking for an outfit for a specific life event, need, or mood.

        Instead of just listing keywords, think about the ultimate USE-CASE. Combine the occasion, weather, and style into natural human phrases.

        Examples of good "vibes": 
        - "outfit for a summer beach wedding"
        - "smart casual clothes for a tech job interview"
        - "cozy weekend lounge wear for winter"
        - "edgy first date outfit"
        - "breathable gym clothes for heavy sweating"

        CRITICAL RULES:
        1. DO NOT invent colors, materials, patterns, or features not explicitly mentioned in the product data. Base the vibe strictly on what the item actually is.
        2. Write the queries as natural, short phrases (6-10 words).
        3. Return ONLY a valid JSON array matching the exact same order and IDs.

        Expected JSON Output Format:
        [
          {{"id": <original_id>, "vibes": ["vibe_1", "vibe_2", "vibe_3"]}},
          ...
        ]

        Products Data:
        {json.dumps(products_for_prompt, ensure_ascii=False)}
        """

    try:
        response = generate_with_backoff(prompt)
        generated_data = json.loads(response.text)

        # The prompt pins each result to its original row index.
        results_dict = {item['id']: item['vibes'] for item in generated_data if 'id' in item and 'vibes' in item}

        batch_df = batch_df.copy()
        batch_df['vibe_1'] = batch_df.index.map(lambda x: results_dict.get(x, ["", "", ""])[0] if x in results_dict and len(results_dict[x]) > 0 else "")
        batch_df['vibe_2'] = batch_df.index.map(lambda x: results_dict.get(x, ["", "", ""])[1] if x in results_dict and len(results_dict[x]) > 1 else "")
        batch_df['vibe_3'] = batch_df.index.map(lambda x: results_dict.get(x, ["", "", ""])[2] if x in results_dict and len(results_dict[x]) > 2 else "")

        batch_df['final_semantic_text'] = (
            batch_df['prod_name'].fillna('') + ". " +
            batch_df['detail_desc'].fillna('') + " Vibes: " +
            batch_df['vibe_1'] + ", " + batch_df['vibe_2'] + ", " + batch_df['vibe_3']
        )

        return batch_df, True

    except Exception as e:
        print(f"\n[!] Batch processing failed completely: {e}")
        # Return empty vibe columns so the output CSV keeps a stable schema.
        batch_df['vibe_1'] = ""
        batch_df['vibe_2'] = ""
        batch_df['vibe_3'] = ""
        batch_df['final_semantic_text'] = ""
        return batch_df, False


def enrich_dataset(input_csv: str, output_csv: str, start_row: int, end_row: int, batch_size: int):
    print(f"Loading data from: {input_csv}")
    df = pd.read_csv(input_csv)

    total_rows = len(df)
    print(f"Total rows in dataset: {total_rows:,}")

    end_row = min(end_row, total_rows)
    if start_row >= end_row:
        print("Start row is greater than or equal to end row. Exiting.")
        return

    df_to_process = df.iloc[start_row:end_row]
    total_to_process = len(df_to_process)
    print(f"Targeting rows {start_row} to {end_row} (Total: {total_to_process:,}). Batch size: {batch_size}\n")

    write_header = not os.path.exists(output_csv)

    total_api_calls = 0
    successful_calls = 0
    failed_calls = 0

    for i in range(0, total_to_process, batch_size):
        batch = df_to_process.iloc[i : i + batch_size]
        current_start = start_row + i
        current_end = current_start + len(batch) - 1

        print(f"[*] Processing rows {current_start} through {current_end}...")

        total_api_calls += 1

        enriched_batch, success = process_batch(batch)

        if success:
            successful_calls += 1
        else:
            failed_calls += 1

        # Append immediately - this is the checkpoint.
        enriched_batch.to_csv(output_csv, mode='a', index=False, header=write_header)
        write_header = False

        time.sleep(5)  # stay under the rate limit

    print("\n" + "="*40)
    print("           EXECUTION SUMMARY")
    print("="*40)
    print(f"Rows Processed:     {total_to_process:,}")
    print(f"Total API Calls:    {total_api_calls:,}")
    print(f"Successful Calls:   {successful_calls:,}")
    print(f"Failed Calls:       {failed_calls:,}")
    print("="*40)
    print(f"Results saved incrementally to: {output_csv}")


def parse_args():
    parser = argparse.ArgumentParser(description="Enrich dataset using Gemini API in batches")
    parser.add_argument("--input", required=True, help="Path to the input CSV file")
    parser.add_argument("--output", required=True, help="Path to the output CSV file")
    parser.add_argument("--start", type=int, default=0, help="Row index to start processing from")
    parser.add_argument("--end", type=int, default=100, help="Row index to stop processing at (exclusive)")
    parser.add_argument("--batch-size", type=int, default=10, help="Number of rows to send to the API per request")
    return parser.parse_args()


if __name__ == "__main__":
    args = parse_args()
    enrich_dataset(args.input, args.output, args.start, args.end, args.batch_size)