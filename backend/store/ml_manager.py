from decouple import config
from sentence_transformers import SentenceTransformer


class MLManager:
    """Lazy singleton holding the ML models in memory for the process lifetime."""
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(MLManager, cls).__new__(cls)
            cls._instance._bge_model = None
            cls._instance._outfit_compatibility_model = None
            cls._instance._outfit_complementary_model = None
        return cls._instance

    @property
    def bge_model(self):
        if self._bge_model is None:
            print("🚀 [MLManager] Loading BAAI/bge-small-en-v1.5 into memory...")
            self._bge_model = SentenceTransformer('BAAI/bge-small-en-v1.5')
            print("✅ [MLManager] BGE model loaded successfully!")
        return self._bge_model

    def _load_outfit_transformer(self, checkpoint_env_var):
        """Load an OutfitCLIPTransformer in eval mode from the checkpoint named by
        ``checkpoint_env_var``. Without a checkpoint the task heads are untrained.
        """
        # Lazy import so Django startup doesn't pay the torch import cost.
        from store.outfit_transformer.models.load import load_model

        checkpoint = config(checkpoint_env_var, default=None)
        if checkpoint is None:
            print(f"⚠️ [MLManager] {checkpoint_env_var} is not set - "
                  "loading OutfitCLIPTransformer without trained weights!")
        model = load_model('clip', checkpoint=checkpoint)
        model.eval()
        return model

    @property
    def outfit_compatibility_model(self):
        """Compatibility Prediction head: ``predict_score([FashionCompatibilityQuery(...)])``."""
        if self._outfit_compatibility_model is None:
            print("🚀 [MLManager] Loading OutfitCLIPTransformer (compatibility) into memory...")
            self._outfit_compatibility_model = self._load_outfit_transformer(
                'OUTFIT_COMPATIBILITY_CHECKPOINT'
            )
            print("✅ [MLManager] Outfit compatibility model loaded successfully!")
        return self._outfit_compatibility_model

    @property
    def outfit_complementary_model(self):
        """Complementary Item Retrieval head: ``embed_query([FashionComplementaryQuery(...)])``
        and ``embed_item([FashionItem(...)])``.
        """
        if self._outfit_complementary_model is None:
            print("🚀 [MLManager] Loading OutfitCLIPTransformer (complementary) into memory...")
            self._outfit_complementary_model = self._load_outfit_transformer(
                'OUTFIT_COMPLEMENTARY_CHECKPOINT'
            )
            print("✅ [MLManager] Outfit complementary model loaded successfully!")
        return self._outfit_complementary_model


ml_models = MLManager()