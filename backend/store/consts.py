"""Shared constants for the store app (semantic search + outfit bundling)."""

SEMANTIC_SEARCH_LIMIT = 12

# One item per category per bundle. The seed's category comes from semantic
# search; the rest are filled iteratively by the Outfit Transformer.
BUNDLE_CATEGORIES = ["shirts", "pants", "footwear"]
NUM_BUNDLES = 5

# Retrieve-then-rerank: bundle items are only ever picked from each category's
# top-M query-relevant pool, which is what guarantees every item is on-query.
TOP_M_PER_CATEGORY = 150

# Blend used to pick each item within its pool. Relevance-heavy on purpose:
# query relevance matters more than item-to-item matching.
SELECTION_RELEVANCE_WEIGHT = 0.6
SELECTION_COMPATIBILITY_WEIGHT = 0.4

# Final bundle ranking:
#   query_weight * min_item_relevance + compatibility_weight * outfit_compatibility
# Ranking on the *minimum* per-item relevance means a bundle only ranks high
# when its weakest item is still on-query.
DEFAULT_QUERY_WEIGHT = 0.6
DEFAULT_COMPATIBILITY_WEIGHT = 0.4

DEFAULT_NUM_BUNDLES = 5
CIR_BATCH_SIZE = 64
