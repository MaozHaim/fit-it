"""Preprocess the Qdrant/hm_ecommerce_products Hugging Face dataset: keep
Menswear only, collapse the many product sub-categories into 4 main ones
(shirts, pants, footwear, coats_jackets), and drop incomplete/duplicate rows.

Usage:
  python data_cleaning_and_filtering.py --out-dir ./processed
"""

from __future__ import annotations

import argparse
import os
from typing import Dict, List

import numpy as np
import pandas as pd
from datasets import load_dataset


def build_mapping() -> Dict[str, List[str]]:
    """Main category -> subcategory names as they appear in product_type_name."""
    return {
       "shirts": [
          "t-shirt",
          "t shirt",
          "shirt",
          "polo shirt",
          "top",
          "vest top",
          "t-shirt / top",
          "tank top",
       ],
       "pants": [
          "trousers",
          "shorts",
       ],
       "footwear": [
          "bootie",
          "boots",
          "flat shoe",
          "flat shoes",
          "flip flop",
          "sandals",
          "slippers",
          "sneakers",
          "other shoe",
       ],
       "coats_jackets": [
          "coat",
          "jacket",
          "blazer",
          "hoodie",
          "cardigan",
          "outdoor waistcoat",
          "tailored waistcoat",
       ],
    }


def invert_mapping(map_d: Dict[str, List[str]]) -> Dict[str, str]:
    """Invert build_mapping() into lowercase subcategory -> main category."""
    lookup: Dict[str, str] = {}
    for main_cat, subs in map_d.items():
       for s in subs:
          lookup[s.strip().lower()] = main_cat
    return lookup


def normalize_pt_name(name: str) -> str:
    if name is None:
       return ""
    return str(name).strip().lower()


def preprocess(out_dir: str) -> pd.DataFrame:
    print("Loading Hugging Face dataset 'Qdrant/hm_ecommerce_products' (train split)...")
    ds = load_dataset("Qdrant/hm_ecommerce_products", split="train")

    print("Converting to pandas DataFrame...")
    df = ds.to_pandas()

    print(f"Initial number of rows: {len(df):,}")

    df = df[df["index_name"] == "Menswear"].copy()
    print(f"After filtering index_name == 'Menswear': {len(df):,}")

    mapping = build_mapping()
    lookup = invert_mapping(mapping)

    df["_pt_norm"] = df["product_type_name"].apply(normalize_pt_name)

    def map_to_main(pt_norm: str) -> str:
       if pt_norm in lookup:
          return lookup[pt_norm]
       # Fall back to token matching: some values contain '/' or are plural.
       tokens = [t.strip() for t in pt_norm.replace("/", " ").split() if t.strip()]
       for t in tokens:
          if t in lookup:
             return lookup[t]
       return ""

    df["product_type_name"] = df["_pt_norm"].apply(map_to_main)
    df.drop(columns=["_pt_norm"], inplace=True)

    keep_cols = [
       "prod_name",
       "product_type_name",
       "graphical_appearance_name",
       "perceived_colour_value_name",
       "perceived_colour_master_name",
       "department_name",
       "index_name",
       "detail_desc",
       "image_url",
    ]

    df = df[keep_cols].copy()

    # Anything that didn't map to a main category came back as "".
    df = df[df["product_type_name"].isin(["shirts", "pants", "footwear", "coats_jackets"])].copy()
    print(f"After mapping to 4 main categories: {len(df):,}")

    # Blank-but-present values count as missing.
    df = df.replace(r'^\s*$', np.nan, regex=True)
    df = df.dropna()
    print(f"After dropping rows with missing/empty values: {len(df):,}")

    df = df.drop_duplicates(
        subset=[
            "prod_name",
            "detail_desc",
            "perceived_colour_master_name",
            "perceived_colour_value_name",
            "graphical_appearance_name"
        ],
        ignore_index=True
    )
    print(f"After dropping semantic duplicates: {len(df):,}")

    os.makedirs(out_dir, exist_ok=True)
    csv_path = os.path.join(out_dir, "processed_menswear.csv")

    print(f"Saving CSV -> {csv_path}")
    df.to_csv(csv_path, index=False)

    print("Done.")
    return df


def parse_args() -> argparse.Namespace:
    p = argparse.ArgumentParser(description="Preprocess Qdrant/hm_ecommerce_products for Menswear and 4 main categories")
    p.add_argument("--out-dir", default="./processed", help="Output directory for processed files")
    return p.parse_args()


if __name__ == "__main__":
    args = parse_args()
    preprocess(args.out_dir)