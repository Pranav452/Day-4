#!/usr/bin/env python3
"""
LLM Model Comparison Tool - Free Local Models Edition
Author: Pranav
Description: Compare base, instruct, and fine-tuned models using HuggingFace transformers
"""

import argparse
import os
from models.model_manager import ModelManager
from utils.report_generator import ReportGenerator

def main():
    parser = argparse.ArgumentParser(description='Compare different types of LLM models')
    parser.add_argument('--query', '-q', type=str, required=True, 
                       help='Query to test across models')
    parser.add_argument('--model-type', '-t', choices=['base', 'instruct', 'fine-tuned', 'all'],
                       default='all', help='Type of models to test')
    parser.add_argument('--output', '-o', type=str, default='comparisons.md',
                       help='Output file for comparison results')
    
    args = parser.parse_args()
    
    print("🤖 LLM Model Comparison Tool")
    print("=" * 50)
    print(f"Query: {args.query}")
    print(f"Model type: {args.model_type}")
    
    # Initialize model manager and run comparison
    model_manager = ModelManager()
    results = model_manager.compare_models(args.query, args.model_type)
    
    # Generate report
    report_gen = ReportGenerator()
    report_gen.generate_report(results, args.output)
    
    print(f"\nReport saved to: {args.output}")

if __name__ == "__main__":
    main() 