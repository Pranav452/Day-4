"""
Model Manager for LLM Comparison Tool
Handles loading and running different types of models using HuggingFace transformers
"""

import torch
from transformers import (
    AutoTokenizer, AutoModelForCausalLM, 
    pipeline, GPT2LMHeadModel, GPT2Tokenizer
)
import time
import warnings
warnings.filterwarnings("ignore")

class ModelManager:
    def __init__(self):
        """Initialize the model manager with predefined free models"""
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        print(f"Using device: {self.device}")
        
        # Define our free model categories
        self.model_configs = {
            'base': {
                'gpt2-small': {
                    'model_name': 'gpt2',
                    'description': 'Original GPT-2 base model - raw text completion',
                    'context_window': 1024
                },
                'distilgpt2': {
                    'model_name': 'distilgpt2',
                    'description': 'Smaller, faster version of GPT-2',
                    'context_window': 1024
                }
            },
            'instruct': {
                'dialogpt-small': {
                    'model_name': 'microsoft/DialoGPT-small',
                    'description': 'Conversational model trained for dialog (your familiar model)',
                    'context_window': 1024
                },
                'gpt2-medium': {
                    'model_name': 'gpt2-medium',
                    'description': 'Larger GPT-2 model with better instruction following',
                    'context_window': 1024
                }
            },
            'fine-tuned': {
                'gpt2-large': {
                    'model_name': 'gpt2-large',
                    'description': 'Larger GPT-2 model - shows scaling effects',
                    'context_window': 1024
                }
            }
        }
        
        self.loaded_models = {}
        self.loaded_tokenizers = {}
    
    def load_model(self, model_name):
        """Load a model and tokenizer if not already loaded"""
        if model_name not in self.loaded_models:
            print(f"Loading model: {model_name}...")
            try:
                # Load tokenizer
                tokenizer = AutoTokenizer.from_pretrained(model_name)
                if tokenizer.pad_token is None:
                    tokenizer.pad_token = tokenizer.eos_token
                
                # Load model
                model = AutoModelForCausalLM.from_pretrained(
                    model_name,
                    torch_dtype=torch.float16 if self.device == "cuda" else torch.float32,
                    device_map="auto" if self.device == "cuda" else None
                )
                
                self.loaded_models[model_name] = model
                self.loaded_tokenizers[model_name] = tokenizer
                print(f"✅ Loaded {model_name}")
                
            except Exception as e:
                print(f"❌ Failed to load {model_name}: {str(e)}")
                return None
        
        return self.loaded_models.get(model_name), self.loaded_tokenizers.get(model_name)
    
    def generate_response(self, model_name, query, max_length=150):
        """Generate response from a specific model"""
        load_result = self.load_model(model_name)
        if load_result is None:
            return "Error: Could not load model"
        
        model, tokenizer = load_result
        if model is None or tokenizer is None:
            return "Error: Could not load model"
        
        try:
            # Tokenize input
            inputs = tokenizer.encode(query, return_tensors="pt")
            if self.device == "cuda":
                inputs = inputs.to(self.device)
            
            # Generate response
            start_time = time.time()
            with torch.no_grad():
                outputs = model.generate(
                    inputs,
                    max_length=max_length,
                    num_return_sequences=1,
                    temperature=0.7,
                    do_sample=True,
                    pad_token_id=tokenizer.eos_token_id
                )
            
            generation_time = time.time() - start_time
            
            # Decode response
            response = tokenizer.decode(outputs[0], skip_special_tokens=True)
            
            # Remove the original query from response if it's included
            if response.startswith(query):
                response = response[len(query):].strip()
            
            return {
                'response': response,
                'generation_time': round(generation_time, 2),
                'tokens_generated': len(outputs[0]) - len(inputs[0])
            }
            
        except Exception as e:
            return f"Error generating response: {str(e)}"
    
    def compare_models(self, query, model_type='all'):
        """Compare models across specified type(s)"""
        results = {
            'query': query,
            'timestamp': time.strftime("%Y-%m-%d %H:%M:%S"),
            'comparisons': {}
        }
        
        types_to_test = [model_type] if model_type != 'all' else ['base', 'instruct', 'fine-tuned']
        
        for mtype in types_to_test:
            if mtype in self.model_configs:
                results['comparisons'][mtype] = {}
                
                for model_key, config in self.model_configs[mtype].items():
                    print(f"\n🔄 Testing {mtype} model: {model_key}")
                    
                    response_data = self.generate_response(config['model_name'], query)
                    
                    results['comparisons'][mtype][model_key] = {
                        'config': config,
                        'response_data': response_data
                    }
        
        return results
    
    def get_model_info(self, model_name):
        """Get information about a specific model"""
        for category, models in self.model_configs.items():
            for key, config in models.items():
                if config['model_name'] == model_name:
                    return {
                        'category': category,
                        'key': key,
                        'config': config
                    }
        return None 