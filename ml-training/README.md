# Jira Story Duration Prediction AI

## 📌 Project Overview
An AI-powered solution that predicts the duration of Jira stories based on historical project data, helping teams with better planning and resource management.

## 🎯 Features
- Predicts task duration in hours based on story details
- Fine-tuned on your historical Jira data
- Private and secure (all data stays internal)
- Easy integration with existing systems

## 🛠️ Tech Stack
- **Backend**: Python (Flask)
- **Frontend**: Angular
- **ML Framework**: Transformers, PEFT (LoRA)
- **Models**: 
  - Qwen/Qwen2-0.5B-Instruct (primary)
  - Mistral-7B (optional)
- **Deployment**: Docker (recommended)

## 🚀 Getting Started

### Prerequisites
- Python 3.8+
- pip
- CUDA-compatible GPU (recommended)

### Installation
1. Clone the repository
2. Set up a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: .\venv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

### Configuration
1. Create a `.env` file with your configuration:
   ```env
   MODEL_NAME=qwen
   MAX_TOKENS=512
   TEMPERATURE=0.7
   ```

## 🏗️ Project Structure
```
jira-prediction-ai/
├── data/                    # Training data and datasets
├── models/                  # Saved models and adapters
├── scripts/
│   ├── inference_server.py  # Flask API for predictions
│   └── train.py            # Training script
├── frontend/               # Angular frontend
└── README.md
```

## 🧠 Model Training
To fine-tune the model on your Jira data:

```bash
python scripts/train.py \
  --model_name qwen \
  --data_path data/training_data.jsonl \
  --output_dir models/jira_adapter
```

## 🚀 Running the API

```bash
# Start the inference server
python scripts/inference_server.py

# Test the API
curl -X POST http://localhost:5001/chat \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Estimate hours for: Implement user authentication. Story points: 3"}'
```

## 🌐 API Endpoints

### Predict Duration
```
POST /chat
Content-Type: application/json

{
  "prompt": "Estimate hours for: [task description]",
  "model": "qwen"  # optional
}
```

### Health Check
```
GET /health
```

## 📊 Example Training Data Format
```json
{
  "prompt": "Estimate duration in hours for task: 'Implement login feature'. Story points: 3.",
  "completion": " 12"
}
```

## 🤝 Contributing
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a pull request

## 📄 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments
- Transformers library by Hugging Face
- LoRA for efficient fine-tuning
- Qwen and Mistral model teams
