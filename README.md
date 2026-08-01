# Fit It

A menswear e-commerce site with two AI-driven discovery features: **natural-language semantic search** and **outfit bundling** - describe an occasion ("smart casual for a tech interview") and get back complete, coordinated outfits assembled from the catalog.

- **Backend** - Django + Django REST Framework, PostgreSQL (+ `pgvector`). Runs on `http://127.0.0.1:8001`.
- **Frontend** - React (Create React App), React Router, axios. Runs on `http://localhost:3000`.

```text
fit-it/
├── .env                      # provided separately - not in the repo
├── backend/
│   ├── fitit/                # settings, URLs, JWT auth, pagination
│   ├── store/                # products, orders, semantic search, bundling
│   │   ├── semantic_search/
│   │   ├── bundling/
│   │   └── outfit_transformer/   # vendored Outfit Transformer model code
│   ├── users/                # register / profile
│   └── data_preprocessing/   # dataset cleaning, LLM enrichment, DB seeding
└── frontend/src/             # pages, components, contexts
```

---

## Running locally

### Requirements

- Python 3.11
- Node.js + npm

There is no local database to set up: the backend connects to a shared **remote PostgreSQL** server, already migrated and seeded. Run all commands from the project root.

### 1. Add the provided `.env`

Do **not** create one by hand. A prepared `.env` with the required configuration and passwords is sent separately; place it in the project root, next to `backend/` and `frontend/`.

It supplies `SECRET_KEY`, `DEBUG`, `ALLOWED_HOSTS`, the `DB_*` connection settings for the remote database, and (for bundling) the model checkpoint paths.

### 2. Start the backend

```bash
cd backend && python -m venv .venv
```

Activate it - `.venv\Scripts\activate` on Windows, `source .venv/bin/activate` on macOS/Linux - then:

```bash
pip install -r requirements.txt && python manage.py runserver 8001
```

### 3. Start the frontend

In a second terminal:

```bash
cd frontend && npm install && npm start
```

npm install installs all dependencies defined in package.json. It also automatically creates the package-lock.json file and the node_modules directory.

Then open `http://localhost:3000`.

> The frontend calls the API with relative paths (`/api/...`), so it needs CRA's `proxy` field pointing at `http://127.0.0.1:8001`. Note that `frontend/package.json` is absent from this checkout - restore it (with `proxy`, `react-scripts`, `react-router-dom`, `axios`, `react-icons`) before running `npm install`.

### 4. Enable outfit bundling (optional)

Product browsing, search, cart and checkout all work without this. Bundling additionally needs the two Outfit Transformer checkpoints.

```bash
cd backend/store/outfit_transformer && mkdir -p checkpoints
gdown 1mzNqGBmd8UjVJjKwVa5GdGYHKutZKSSi -O checkpoints.zip
unzip checkpoints.zip -d ./checkpoints && rm checkpoints.zip
```

On Windows, swap the extract step for `python -m zipfile -e checkpoints.zip ./checkpoints`.

Then point the `.env` at the two extracted `.pt`/`.pth` files, using **absolute paths**:

```env
OUTFIT_COMPATIBILITY_CHECKPOINT=/abs/path/to/backend/store/outfit_transformer/checkpoints/compatibility_best.pt
OUTFIT_COMPLEMENTARY_CHECKPOINT=/abs/path/to/backend/store/outfit_transformer/checkpoints/complementary_best.pt
```

`ml_manager.py` loads them into memory on the first request that needs them. Without the checkpoints the endpoint still responds, but with untrained task heads - the results are meaningless.

---

## API

| Endpoint | Notes |
| --- | --- |
| `GET /api/store/products/` | Paginated; `?category=`, `?search=`, `?tag=new\|sale`, `?page_size=` (max 500) |
| `GET /api/store/products/semantic_search/` | `?q=` plus optional `main_category=`, `colors=` (comma-separated, excluded) |
| `GET /api/store/bundling/` | `?q=`, `main_category=`, `num_bundles=` (1–20), `colors=` |
| `GET/POST /api/store/orders/` | Scoped to the authenticated user when a token is present |
| `POST /api/auth/register/`, `POST /api/auth/login/`, `GET /api/auth/profile/` | JWT - `login` returns access + refresh |

---

## Core features

### Two embedding tables, two jobs

Every product carries two kinds of precomputed vectors, in separate tables:

- **`ProductEmbeddingText`** - several rows per product: one BGE (`BAAI/bge-small-en-v1.5`, 384-d) vector for the description plus one per generated "vibe". Drives semantic search.
- **`ProductEmbeddingImage`** - exactly one row per product: the 1024-d Fashion-CLIP item vector (512-d image projection ‖ 512-d text projection). Drives bundling.

Both denormalize `category` and `color` from `Product` so vector queries hard-filter on an indexed column in the embedding table itself, with no join back to `Product`.

The CLIP vector is precomputed at import time rather than per request because the image download plus Fashion-CLIP forward pass dominates bundling cost - and the CLIP backbone is frozen, so the vector doesn't depend on the trained checkpoints.

### Semantic search

Filters are pushed down to the database *before* the vector scan (category, active, excluded colors), which prevents vector starvation - otherwise the nearest neighbours could all be filtered away afterwards. It over-fetches `limit * 4` rows and de-duplicates to one row per product in Python, since a product has several vibe vectors and any of them can match. The winning row's text and cosine distance ride back on the product as `matched_vibe` / `match_distance`.

### Outfit bundling - retrieve, then rerank

`store/bundling/bundle_service.py` builds whole outfits (one item per category in `BUNDLE_CATEGORIES`) for a free-text query:

1. **Retrieve.** Per category, pull the top-M (150) query-relevant products via semantic search. These pools are the *only* items a bundle may draw from - that's what keeps every item on-query.
2. **Project.** Load the pooled products' stored 1024-d CLIP vectors and project them into the Outfit Transformer's 128-d CIR space. Only the pools are projected, not the catalog.
3. **Fill.** The top seeds of the `main_category` pool start the bundles. For each seed, predict the next complementary item's embedding, then pick from that category's pool by a soft blend of query relevance and compatibility - both min-max normalized within the pool so the weights are comparable. Chosen items leave the pool so bundles don't repeat items.
4. **Rank.** Score the finished outfit with the compatibility model, then rank by `query_weight * min_item_relevance + compatibility_weight * compatibility`. Ranking on the **minimum** per-item relevance means a bundle only scores well when its *weakest* item is still on-query.

Torch is imported lazily (in the view and in `ml_manager`), so Django startup doesn't pay for it unless bundling is actually hit.

### Tuning

Every knob lives in `store/consts.py`:

| Constant | Default | Effect |
| --- | --- | --- |
| `TOP_M_PER_CATEGORY` | 150 | The main relevance/coherence trade-off. Smaller is more on-query but risks *starvation* - no compatible item in the pool, so outfits clash. Larger weakens the relevance guarantee at the tail. |
| `SELECTION_RELEVANCE_WEIGHT` / `SELECTION_COMPATIBILITY_WEIGHT` | 0.6 / 0.4 | How each item is picked within its pool. Relevance-heavy on purpose. |
| `DEFAULT_QUERY_WEIGHT` / `DEFAULT_COMPATIBILITY_WEIGHT` | 0.6 / 0.4 | Final bundle ranking. |
| `BUNDLE_CATEGORIES` | shirts, pants, footwear | Outerwear's model key is `coats_jackets`. |
| `SEMANTIC_SEARCH_LIMIT`, `NUM_BUNDLES`, `CIR_BATCH_SIZE` | 12, 5, 64 | Result counts and CIR projection batch size. |

An empty category pool just leaves that slot out - the bundle comes back with fewer items.

### Authentication

`SilentJWTAuthentication` is the project-wide default: it behaves like `JWTAuthentication` but returns `None` instead of raising on a bad or expired token. That lets public endpoints keep working when a client sends a stale token, while `IsAuthenticated` views (e.g. `/api/auth/profile/`) still reject it. On the client, an axios response interceptor clears the stored session on any 401.

### Frontend notes

- `AuthContext` persists user + tokens in `localStorage` and sets the axios `Authorization` header; `CartContext` holds the cart in memory only.
- `ProductsPage` fetches one large page (up to 500) and does filtering, sorting and infinite scroll client-side, with an `IntersectionObserver` sentinel. Filters are staged as *pending* state inside the panel and only committed on Apply.
- `colorsCache` derives the color swatch list from the live catalog against a fixed name→hex map, memoized behind a single in-flight promise.

---

## Data pipeline

The catalog is derived from the `Qdrant/hm_ecommerce_products` Hugging Face dataset. The three stages under `backend/data_preprocessing/` are run manually, in order - **not** part of local setup: the shared remote database is already seeded, and re-running the import writes to it for everyone.

```bash
python data_cleaning_and_filtering.py --out-dir ./processed
```

Filters to Menswear, collapses many `product_type_name` values into the four main categories (shirts, pants, footwear, coats_jackets), drops incomplete and duplicate rows.

```bash
python data_enrichment.py --input ./processed/processed_menswear.csv --output ./processed/enriched_menswear.csv --start 0 --end 100 --batch-size 10
```

Asks Gemini for three natural-language "vibes" per product - the use-case phrasing a shopper would actually type ("outfit for a summer beach wedding"). These become extra search vectors, and are what make search feel occasion-aware rather than keyword-based. Batched, with exponential backoff on 429/503 and incremental CSV appends so a crash doesn't lose completed work. Needs `GEMINI_API_KEY` in the environment.

```bash
python manage.py import_products /path/to/enriched_menswear.csv
```

Seeds the database and builds both embedding types per product, inside one atomic transaction. Two kinds of row are skipped rather than imported: duplicates (same name + color + shade, checked before any network call) and any product whose image can't be downloaded - no image means no CLIP vector, which makes the product useless for bundling. Prices are random (the source dataset has none) and brand is hardcoded to H&M.

Verify an import with:

```bash
python manage.py shell -c "from store.models import *; print(Product.objects.count(), ProductEmbeddingText.objects.count(), ProductEmbeddingImage.objects.count())"
```

Expect several text embeddings per product and exactly one image embedding per product.
