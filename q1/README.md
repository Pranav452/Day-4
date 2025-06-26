# LLM Model Comparison Tool

A command-line tool to compare different types of Language Models (Base, Instruct, and Fine-tuned) using completely **free** local models via HuggingFace Transformers.

## 🎯 What This Tool Does

This tool helps you understand the differences between:
- **Base Models**: Raw pretrained models (like GPT-2) that complete text
- **Instruct Models**: Models trained to follow instructions (like DialoGPT)  
- **Fine-tuned Models**: Models specialized for specific tasks (like CodeGPT for coding)

## 🆓 Models Used (All Free!)

### Base Models
- `gpt2` - Original GPT-2 base model
- `distilgpt2` - Smaller, faster GPT-2 variant

### Instruct Models  
- `microsoft/DialoGPT-small` - Conversational model (you used this before!)
- `microsoft/DialoGPT-medium` - Larger conversational model

### Fine-tuned Models
- `microsoft/CodeGPT-small-py` - Specialized for Python code generation

## 🚀 Quick Start

### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

### 2. Run a Simple Comparison
```bash
python main.py --query "Explain how photosynthesis works" --model-type all
```

### 3. Test Specific Model Types
```bash
# Test only instruction-following models
python main.py --query "Write a Python function to calculate fibonacci" --model-type instruct

# Test only base models
python main.py --query "The weather today is" --model-type base

# Test only fine-tuned models
python main.py --query "def calculate_area(radius):" --model-type fine-tuned
```

## 📊 Understanding the Output

The tool generates a `comparisons.md` file with:

1. **Results Table**: Quick comparison of all model responses
2. **Detailed Analysis**: Full responses from each model
3. **Key Observations**: What each model type is good/bad at

## 🔍 Example Queries to Try

### Good for Base Models:
- "Once upon a time, in a distant galaxy"
- "The recipe for chocolate cake includes"

### Good for Instruct Models:
- "Explain quantum computing in simple terms"
- "What are the benefits of exercise?"

### Good for Fine-tuned Models:
- "Write a Python function to sort a list"
- "def fibonacci(n):"

## 🧠 What You'll Learn

1. **Base models** often continue text naturally but ignore instructions
2. **Instruct models** are better at answering questions and following commands
3. **Fine-tuned models** excel in their specific domain but may be worse at general tasks
4. Performance differences between model sizes and architectures

## 🛠 Technical Details

- **No API Keys Required**: All models run locally
- **Device Support**: Automatically uses GPU if available, falls back to CPU
- **Model Caching**: Models are downloaded once and cached locally
- **Memory Efficient**: Uses optimized loading for better performance

## 📝 Assignment Requirements Met

✅ CLI tool for model comparison  
✅ Tests base, instruct, and fine-tuned models  
✅ Generates `comparisons.md` report  
✅ Uses completely free models  
✅ No external API costs  
✅ Includes model descriptions and performance metrics  

## 🔧 Troubleshooting

**Model download is slow**: First time downloads can take a few minutes per model. They're cached after that.

**Out of memory**: Try smaller models or reduce max_length in the model manager.

**Import errors**: Make sure you've installed all requirements: `pip install -r requirements.txt`

## 📚 Understanding the Code Structure

```
├── main.py                 # CLI entry point
├── models/
│   ├── model_manager.py    # Handles loading and running models
├── utils/
│   └── report_generator.py # Creates markdown reports
└── requirements.txt        # Python dependencies
```

This gives you hands-on experience with different model types without spending any money! 