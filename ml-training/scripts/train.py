import os
import json
import torch
from datasets import Dataset
from transformers import (
    AutoModelForCausalLM,
    AutoTokenizer,
    TrainingArguments,
    BitsAndBytesConfig
)
from peft import LoraConfig, get_peft_model
from trl import SFTTrainer
from typing import Dict, List, Optional
import argparse
import logging
from pathlib import Path

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def load_training_data(file_path: str) -> List[Dict]:
    """Load training data from JSONL file."""
    data = []
    with open(file_path, 'r', encoding='utf-8') as f:
        for line in f:
            data.append(json.loads(line))
    return data

def format_training_example(example: Dict) -> str:
    """Format a single training example as a prompt-completion pair."""
    prompt = f"Estimate duration in hours for task: '{example['title']}'. Description: {example['description']}. Story points: {example.get('story_points', 'N/A')}."
    completion = f" {example['actual_hours']}"
    return {"text": f"{prompt}{completion}"}

def train(
    model_name: str = "Qwen/Qwen2-0.5B-Instruct",
    data_path: str = "../data/training_data.jsonl",
    output_dir: str = "../models/jira_adapter",
    num_train_epochs: int = 3,
    per_device_train_batch_size: int = 4,
    learning_rate: float = 2e-4,
    lora_rank: int = 8,
    lora_alpha: int = 32,
    lora_dropout: float = 0.1,
    max_seq_length: int = 512,
    use_4bit: bool = True,
):
    """
    Fine-tune a language model on Jira story duration prediction.
    
    Args:
        model_name: Name or path of the pre-trained model
        data_path: Path to the training data in JSONL format
        output_dir: Directory to save the fine-tuned model
        num_train_epochs: Number of training epochs
        per_device_train_batch_size: Batch size per device
        learning_rate: Learning rate for training
        lora_rank: Rank for LoRA adaptation
        lora_alpha: Alpha parameter for LoRA
        lora_dropout: Dropout probability for LoRA layers
        max_seq_length: Maximum sequence length
        use_4bit: Whether to use 4-bit quantization
    """
    # Create output directory
    os.makedirs(output_dir, exist_ok=True)
    
    # Load and prepare dataset
    logger.info(f"Loading training data from {data_path}")
    raw_data = load_training_data(data_path)
    formatted_data = [format_training_example(ex) for ex in raw_data]
    dataset = Dataset.from_list(formatted_data)
    
    # Configure model loading
    model_kwargs = {
        "device_map": "auto",
        "trust_remote_code": True
    }
    
    # Configure 4-bit quantization if enabled
    if use_4bit:
        logger.info("Using 4-bit quantization")
        bnb_config = BitsAndBytesConfig(
            load_in_4bit=True,
            bnb_4bit_quant_type="nf4",
            bnb_4bit_compute_dtype=torch.float16,
            bnb_4bit_use_double_quant=True,
        )
        model_kwargs["quantization_config"] = bnb_config
    
    # Load model and tokenizer
    logger.info(f"Loading model: {model_name}")
    model = AutoModelForCausalLM.from_pretrained(
        model_name,
        **model_kwargs
    )
    
    tokenizer = AutoTokenizer.from_pretrained(
        model_name,
        trust_remote_code=True
    )
    tokenizer.pad_token = tokenizer.eos_token
    
    # Configure LoRA
    logger.info("Preparing model for LoRA fine-tuning")
    lora_config = LoraConfig(
        r=lora_rank,
        lora_alpha=lora_alpha,
        lora_dropout=lora_dropout,
        bias="none",
        task_type="CAUSAL_LM",
        target_modules=["q_proj", "k_proj", "v_proj", "o_proj", "gate_proj", "up_proj", "down_proj"]
    )
    
    model = get_peft_model(model, lora_config)
    model.print_trainable_parameters()
    
    # Configure training arguments
    training_args = TrainingArguments(
        output_dir=output_dir,
        num_train_epochs=num_train_epochs,
        per_device_train_batch_size=per_device_train_batch_size,
        gradient_accumulation_steps=4,
        gradient_checkpointing=True,
        optim="paged_adamw_32bit",
        learning_rate=learning_rate,
        fp16=not use_4bit,
        bf16=use_4bit,
        logging_steps=10,
        save_strategy="epoch",
        save_total_limit=3,
        report_to="none",
        max_grad_norm=0.3,
        warmup_ratio=0.03,
        lr_scheduler_type="cosine",
    )
    
    # Initialize trainer
    trainer = SFTTrainer(
        model=model,
        args=training_args,
        train_dataset=dataset,
        dataset_text_field="text",
        max_seq_length=max_seq_length,
        tokenizer=tokenizer,
    )
    
    # Train the model
    logger.info("Starting training...")
    trainer.train()
    
    # Save the final model
    logger.info(f"Saving model to {output_dir}")
    trainer.model.save_pretrained(output_dir)
    tokenizer.save_pretrained(output_dir)
    
    logger.info("Training completed successfully!")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Fine-tune a language model for Jira story duration prediction")
    parser.add_argument("--model_name", type=str, default="Qwen/Qwen2-0.5B-Instruct",
                       help="Name or path of the pre-trained model")
    parser.add_argument("--data_path", type=str, default="../data/training_data.jsonl",
                       help="Path to the training data in JSONL format")
    parser.add_argument("--output_dir", type=str, default="../models/jira_adapter",
                       help="Directory to save the fine-tuned model")
    parser.add_argument("--num_train_epochs", type=int, default=3,
                       help="Number of training epochs")
    parser.add_argument("--per_device_train_batch_size", type=int, default=4,
                       help="Batch size per device")
    parser.add_argument("--learning_rate", type=float, default=2e-4,
                       help="Learning rate for training")
    parser.add_argument("--lora_rank", type=int, default=8,
                       help="Rank for LoRA adaptation")
    parser.add_argument("--lora_alpha", type=int, default=32,
                       help="Alpha parameter for LoRA")
    parser.add_argument("--lora_dropout", type=float, default=0.1,
                       help="Dropout probability for LoRA layers")
    parser.add_argument("--max_seq_length", type=int, default=512,
                       help="Maximum sequence length")
    parser.add_argument("--no_4bit", action="store_false", dest="use_4bit",
                       help="Disable 4-bit quantization")
    
    args = parser.parse_args()
    
    # Create data directory if it doesn't exist
    os.makedirs(os.path.dirname(args.data_path), exist_ok=True)
    
    # Start training
    train(
        model_name=args.model_name,
        data_path=args.data_path,
        output_dir=args.output_dir,
        num_train_epochs=args.num_train_epochs,
        per_device_train_batch_size=args.per_device_train_batch_size,
        learning_rate=args.learning_rate,
        lora_rank=args.lora_rank,
        lora_alpha=args.lora_alpha,
        lora_dropout=args.lora_dropout,
        max_seq_length=args.max_seq_length,
        use_4bit=args.use_4bit,
    )
