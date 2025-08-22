from flask import Flask, request, jsonify
from transformers import AutoModelForCausalLM, AutoTokenizer, BitsAndBytesConfig
from peft import PeftModel, PeftConfig
import torch
from typing import Optional, Dict, Any
import os

# --- CONFIGURATION ---
MODEL_CONFIG = {
    "mistral": {
        "base_model": "mistralai/Mistral-7B-v0.1",
        "load_in_4bit": True,
        "bnb_4bit_quant_type": "nf4",
        "bnb_4bit_compute_dtype": torch.float16,
        "bnb_4bit_use_double_quant": True,
    },
    "qwen": {
        "base_model": "Qwen/Qwen2-0.5B-Instruct",
        "load_in_4bit": False
    }
}

ADAPTER_PATHS = {
    "mistral": "./models/mistral_jira_adapter",
    "qwen": "./models/jira_adapter"
}

# --- HELPER FUNCTIONS ---
def load_model_and_tokenizer(model_name: str):
    """Load base model and tokenizer with appropriate settings"""
    if model_name not in MODEL_CONFIG:
        raise ValueError(f"Unsupported model: {model_name}")
    
    config = MODEL_CONFIG[model_name]
    print(f"Loading base model: {config['base_model']}")
    
    # Configure quantization for 4-bit loading if enabled
    if config.get('load_in_4bit', False):
        bnb_config = BitsAndBytesConfig(
            load_in_4bit=True,
            bnb_4bit_quant_type=config.get('bnb_4bit_quant_type', 'nf4'),
            bnb_4bit_compute_dtype=config.get('bnb_4bit_compute_dtype', torch.float16),
            bnb_4bit_use_double_quant=config.get('bnb_4bit_use_double_quant', False)
        )
        model = AutoModelForCausalLM.from_pretrained(
            config['base_model'],
            quantization_config=bnb_config,
            device_map="auto",
            trust_remote_code=True
        )
    else:
        model = AutoModelForCausalLM.from_pretrained(
            config['base_model'],
            device_map="auto",
            trust_remote_code=True
        )
    
    tokenizer = AutoTokenizer.from_pretrained(
        config['base_model'],
        trust_remote_code=True
    )
    tokenizer.pad_token = tokenizer.eos_token
    
    return model, tokenizer

def load_adapter(model, model_name: str):
    """Load adapter weights if they exist"""
    adapter_path = ADAPTER_PATHS.get(model_name)
    if adapter_path and os.path.exists(adapter_path):
        print(f"Loading adapter from {adapter_path}...")
        model = PeftModel.from_pretrained(model, adapter_path)
        print("✅ Adapter loaded successfully")
    return model

# --- INITIALIZE MODELS ---
models = {}
for model_name in MODEL_CONFIG:
    try:
        model, tokenizer = load_model_and_tokenizer(model_name)
        model = load_adapter(model, model_name)
        models[model_name] = {
            'model': model,
            'tokenizer': tokenizer
        }
        print(f"✅ {model_name.upper()} model loaded and ready")
    except Exception as e:
        print(f"❌ Failed to load {model_name}: {str(e)}")

# --- FLASK API SERVER ---
app = Flask(__name__)

@app.route('/chat', methods=['POST'])
def chat():
    try:
        data = request.get_json()
        prompt = data.get('prompt', '')
        model_name = data.get('model', 'qwen').lower()  # Default to qwen
        
        if not prompt:
            return jsonify({"error": "Prompt is required"}), 400
        
        if model_name not in models:
            return jsonify({"error": f"Model {model_name} not found"}), 404

        model_data = models[model_name]
        model = model_data['model']
        tokenizer = model_data['tokenizer']
        
        # Tokenize input
        inputs = tokenizer(prompt, return_tensors="pt").to(model.device)
        
        # Generate response
        with torch.no_grad():
            outputs = model.generate(
                **inputs,
                max_new_tokens=512,
                temperature=0.7,
                top_p=0.9,
                do_sample=True,
                pad_token_id=tokenizer.eos_token_id
            )
        
        # Decode and clean up response
        response = tokenizer.decode(outputs[0], skip_special_tokens=True)
        
        # For chat models, extract only the assistant's response
        if '[/INST]' in response:
            response = response.split('[/INST]')[-1].strip()
        
        return jsonify({"response": response})

    except Exception as e:
        print(f"Error during prediction: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/models', methods=['GET'])
def list_models():
    """List all available models"""
    return jsonify({
        "available_models": list(models.keys()),
        "default_model": "qwen"
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001)