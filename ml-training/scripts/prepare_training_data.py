import json
import pandas as pd
from typing import List, Dict, Any
from pathlib import Path
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def load_jira_data(csv_path: str) -> pd.DataFrame:
    """Load Jira data from CSV file."""
    logger.info(f"Loading Jira data from {csv_path}")
    return pd.read_csv(csv_path)

def clean_text(text: str) -> str:
    """Clean and normalize text data."""
    if not isinstance(text, str):
        return ""
    # Remove extra whitespace and newlines
    return " ".join(str(text).split())

def convert_to_training_examples(df: pd.DataFrame) -> List[Dict[str, Any]]:
    """Convert Jira data to training examples."""
    examples = []
    
    for _, row in df.iterrows():
        # Extract and clean fields
        title = clean_text(row.get('summary', ''))
        description = clean_text(row.get('description', ''))
        story_points = row.get('story_points', 0)
        actual_hours = row.get('time_spent_hours', 0)
        
        # Skip incomplete or invalid examples
        if not title or actual_hours <= 0:
            continue
            
        examples.append({
            'title': title,
            'description': description,
            'story_points': story_points,
            'actual_hours': round(actual_hours, 2)
        })
    
    return examples

def save_training_data(examples: List[Dict], output_path: str):
    """Save training data to JSONL file."""
    # Create output directory if it doesn't exist
    output_dir = Path(output_path).parent
    output_dir.mkdir(parents=True, exist_ok=True)
    
    # Save as JSONL
    with open(output_path, 'w', encoding='utf-8') as f:
        for example in examples:
            f.write(json.dumps(example, ensure_ascii=False) + '\n')
    
    logger.info(f"Saved {len(examples)} training examples to {output_path}")

def main():
    import argparse
    
    parser = argparse.ArgumentParser(description='Prepare Jira data for training')
    parser.add_argument('--input', type=str, required=True,
                       help='Path to input CSV file with Jira data')
    parser.add_argument('--output', type=str, default='../data/training_data.jsonl',
                       help='Output path for training data (JSONL format)')
    
    args = parser.parse_args()
    
    try:
        # Load and process data
        df = load_jira_data(args.input)
        examples = convert_to_training_examples(df)
        
        # Save training data
        save_training_data(examples, args.output)
        
        # Print statistics
        avg_hours = sum(ex['actual_hours'] for ex in examples) / len(examples)
        logger.info(f"Processed {len(examples)} examples")
        logger.info(f"Average hours per task: {avg_hours:.2f}")
        
    except Exception as e:
        logger.error(f"Error processing data: {str(e)}", exc_info=True)
        raise

if __name__ == "__main__":
    main()
