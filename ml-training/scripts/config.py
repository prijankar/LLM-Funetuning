"""Configuration settings for the Jira Story Duration Prediction system."""

class Config:
    # Model configuration
    MODELS = {
        "qwen": {
            "name": "Qwen/Qwen2-0.5B-Instruct",
            "load_in_4bit": True,
            "use_fast_tokenizer": True,
            "trust_remote_code": True,
            "max_length": 512,
            "temperature": 0.7,
            "top_p": 0.9,
            "adapter_path": "../models/jira_adapter"
        },
        "mistral": {
            "name": "mistralai/Mistral-7B-v0.1",
            "load_in_4bit": True,
            "use_fast_tokenizer": True,
            "trust_remote_code": True,
            "max_length": 512,
            "temperature": 0.7,
            "top_p": 0.9,
            "adapter_path": "../models/mistral_jira_adapter"
        }
    }
    
    # Default model to use
    DEFAULT_MODEL = "qwen"
    
    # Server configuration
    HOST = "0.0.0.0"
    PORT = 5001
    DEBUG = False
    
    # Training configuration
    TRAINING_CONFIG = {
        "learning_rate": 2e-4,
        "num_train_epochs": 3,
        "per_device_train_batch_size": 4,
        "gradient_accumulation_steps": 4,
        "lora_rank": 8,
        "lora_alpha": 32,
        "lora_dropout": 0.1,
        "max_seq_length": 512
    }
    
    # Paths
    DATA_DIR = "../data"
    MODELS_DIR = "../models"
    
    @classmethod
    def get_model_config(cls, model_name: str) -> dict:
        """Get configuration for a specific model."""
        return cls.MODELS.get(model_name, cls.MODELS[cls.DEFAULT_MODEL])
    
    @classmethod
    def get_available_models(cls) -> list:
        """Get list of available model names."""
        return list(cls.MODELS.keys())
