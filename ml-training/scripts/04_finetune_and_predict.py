import sys
import os
import pandas as pd
import argparse  # Importeer argparse
from sqlalchemy import create_engine
import torch
from datasets import Dataset
from urllib.parse import quote_plus
from transformers import (
    AutoModelForCausalLM,
    AutoTokenizer,
    TrainingArguments,
)
from peft import LoraConfig
from trl import SFTTrainer
 
# --- PARSE COMMAND-LINE ARGUMENTEN ---
parser = argparse.ArgumentParser()
parser.add_argument("--model_id", type=str, required=True)
parser.add_argument("--epochs", type=int, default=1)
parser.add_argument("--learning_rate", type=float, default=0.0002)
parser.add_argument("--batch_size", type=int, default=1)
parser.add_argument("--lora_r", type=int, default=16)
parser.add_argument("--lora_alpha", type=int, default=16)
args = parser.parse_args()

# --- Database Configuratie ---
DB_USER = "postgres"
DB_PASSWORD_RAW = "seventeen@12" # Pas aan indien nodig
DB_PASSWORD_ENCODED = quote_plus(DB_PASSWORD_RAW)
DB_HOST = "localhost"
DB_PORT = "5432"
DB_NAME = "jira_ai_db"
DB_CONNECTION_STRING = f"postgresql://{DB_USER}:{DB_PASSWORD_ENCODED}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

ADAPTER_PATH = os.path.join('models', 'jira_adapter')

def create_training_text(row):
    # ... (deze functie blijft hetzelfde)
    summary = row.get('summary', '')
    description = row.get('description', '')
    story_points = row.get('story_points', 0.0)
    time_spent_hours = row.get('time_spent_hours', 0.0)
    prompt = f"Analyseer de volgende Jira story...\n\n**Titel:** {summary}\n**Story Points:** {story_points:.1f}\n\n**Beschrijving:**\n{description}"
    completion = f"**Geschatte Tijd:** {time_spent_hours:.1f} uur."
    return f"<s>[INST] {prompt} [/INST]\n{completion}</s>"

def run_finetuning():
    # ... (data laden uit database blijft hetzelfde)
    engine = create_engine(DB_CONNECTION_STRING)
    df = pd.read_sql("SELECT * FROM training_issues", engine)
    df['text'] = df.apply(create_training_text, axis=1)
    dataset = Dataset.from_pandas(df)
    
    print(f"Laden van basismodel: {args.model_id}")
    model = AutoModelForCausalLM.from_pretrained(args.model_id)
    model.config.use_cache = False
    
    tokenizer = AutoTokenizer.from_pretrained(args.model_id, trust_remote_code=True)
    tokenizer.pad_token = tokenizer.eos_token
    
    peft_config = LoraConfig(
        r=args.lora_r,
        lora_alpha=args.lora_alpha,
        lora_dropout=0.1,
        bias="none",
        task_type="CAUSAL_LM",
        target_modules=["q_proj", "k_proj", "v_proj", "o_proj", "gate_proj", "up_proj", "down_proj"]
    )
    
    training_args = TrainingArguments(
        output_dir=ADAPTER_PATH,
        num_train_epochs=args.epochs,
        per_device_train_batch_size=args.batch_size,
        learning_rate=args.learning_rate,
        gradient_accumulation_steps=4,
        optim="adamw_torch",
        logging_steps=10,
        fp16=False,
        bf16=False,
    )

    trainer = SFTTrainer(
        model=model,
        train_dataset=dataset,
        peft_config=peft_config,
       # tokenizer=tokenizer,
        args=training_args,
      #  dataset_text_field="text",
    )

    print("\nStarten met fine-tuning op de CPU...")
    trainer.train()
    print(" Fine-tuning voltooid!")
    
    trainer.model.save_pretrained(ADAPTER_PATH)
    tokenizer.save_pretrained(ADAPTER_PATH)
    print(f"Adapter opgeslagen in: {ADAPTER_PATH}")

if __name__ == "__main__":
    run_finetuning()