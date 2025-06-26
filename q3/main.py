#!/usr/bin/env python3
"""
Tool-Enhanced Reasoning Script
A script that uses Gemini LLM for chain-of-thought reasoning with external tool calling.

Author: AI Assistant
Description: Takes natural language queries, uses LLM for reasoning, and calls tools when needed.
"""

import argparse
import os
import sys
from typing import Dict, Any

# Add current directory to path for imports
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from llm.gemini_client import GeminiReasoningClient, ReasoningResponse
from reasoning.tool_router import ToolRouter, ToolResult
from reasoning.chain_of_thought import ChainOfThoughtPrompt


class ToolEnhancedReasoning:
    """
    Main class that coordinates LLM reasoning with tool execution.
    """
    
    def __init__(self, api_key: str = None):
        """
        Initialize the tool-enhanced reasoning system.
        
        Args:
            api_key: Gemini API key (optional, will use env var if not provided)
        """
        try:
            self.llm_client = GeminiReasoningClient(api_key)
        except ValueError as e:
            print(f"Error: {e}")
            print("Please set the GEMINI_API_KEY environment variable or provide it as an argument.")
            sys.exit(1)
        
        self.tool_router = ToolRouter()
        
    def process_query(self, query: str, verbose: bool = False) -> Dict[str, Any]:
        """
        Process a natural language query using LLM reasoning and tools.
        
        Args:
            query: Natural language query from user
            verbose: Whether to show detailed processing steps
            
        Returns:
            Dict containing the complete reasoning process and results
        """
        if verbose:
            print("🔄 Processing query with LLM reasoning...")
            print(f"Query: {query}")
            print("-" * 50)
        
        # Step 1: Get initial reasoning from LLM
        reasoning_response = self.llm_client.reason(query)
        
        if not reasoning_response.success:
            return {
                'success': False,
                'error': reasoning_response.error,
                'query': query
            }
        
        if verbose:
            print("\n📝 LLM Reasoning:")
            print(reasoning_response.reasoning)
            print(f"\n🔧 Tools Needed: {reasoning_response.tools_needed}")
        
        # Step 2: Parse and execute tools if needed
        tool_calls = self.tool_router.parse_tools_from_response(reasoning_response.raw_response)
        tool_results = {}
        
        if tool_calls:
            if verbose:
                print(f"\n⚡ Executing {len(tool_calls)} tool(s)...")
            
            tool_results = self.tool_router.execute_all_tools(tool_calls)
            
            if verbose:
                for tool_name, result in tool_results.items():
                    if result.success:
                        print(f"  ✅ {tool_name}: {result.result}")
                    else:
                        print(f"  ❌ {tool_name}: {result.error}")
        
        # Step 3: Determine final answer
        final_answer = reasoning_response.final_answer
        
        # If tools were executed and we need to combine results
        if tool_results and any(result.success for result in tool_results.values()):
            # Create a follow-up prompt to get final answer with tool results
            tool_results_dict = {
                name: result.result if result.success else f"Error: {result.error}"
                for name, result in tool_results.items()
            }
            
            follow_up_prompt = ChainOfThoughtPrompt.create_follow_up_prompt(
                query, reasoning_response.reasoning, tool_results_dict
            )
            
            # Get final answer incorporating tool results
            final_response = self.llm_client.reason(follow_up_prompt)
            if final_response.success:
                final_answer = final_response.final_answer
        
        return {
            'success': True,
            'query': query,
            'reasoning': reasoning_response.reasoning,
            'tools_needed': reasoning_response.tools_needed,
            'tools_used': len(tool_calls) > 0,
            'tool_results': {
                name: result.result if result.success else f"Error: {result.error}"
                for name, result in tool_results.items()
            },
            'final_answer': final_answer,
            'raw_llm_response': reasoning_response.raw_response
        }
    
    def format_output(self, result: Dict[str, Any], show_reasoning: bool = True) -> str:
        """
        Format the reasoning result for display.
        
        Args:
            result: Result dictionary from process_query
            show_reasoning: Whether to include reasoning steps
            
        Returns:
            Formatted output string
        """
        if not result['success']:
            return f"❌ Error: {result['error']}"
        
        output = []
        output.append(f"🔍 Query: {result['query']}")
        output.append("")
        
        if show_reasoning:
            output.append("🧠 LLM Reasoning:")
            output.append(result['reasoning'])
            output.append("")
        
        if result['tools_used']:
            output.append("🔧 Tools Used:")
            for tool_name, tool_result in result['tool_results'].items():
                output.append(f"  • {tool_name}: {tool_result}")
            output.append("")
        else:
            output.append("🔧 Tools Used: None")
            output.append("")
        
        output.append("✅ Final Answer:")
        output.append(result['final_answer'])
        
        return "\n".join(output)


def main():
    """Main CLI entry point"""
    parser = argparse.ArgumentParser(
        description='Tool-Enhanced Reasoning Script using Gemini LLM',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python main.py --query "What's the square root of the average of 18 and 50?"
  python main.py --query "How many vowels are in the word 'Multimodality'?" --verbose
  python main.py --query "Is the number of letters in 'machine' greater than the number of vowels in 'reasoning'?" --no-reasoning
        """
    )
    
    parser.add_argument(
        '--query', '-q', 
        type=str, 
        required=False,
        help='Natural language query to process'
    )
    
    parser.add_argument(
        '--verbose', '-v',
        action='store_true',
        help='Show detailed processing steps'
    )
    
    parser.add_argument(
        '--no-reasoning',
        action='store_true',
        help='Hide reasoning steps in output (show only final answer)'
    )
    
    parser.add_argument(
        '--api-key',
        type=str,
        help='Gemini API key (overrides GEMINI_API_KEY env var)'
    )
    
    parser.add_argument(
        '--list-tools',
        action='store_true',
        help='List all available tools and exit'
    )
    
    args = parser.parse_args()
    
    # Handle tool listing
    if args.list_tools:
        router = ToolRouter()
        print("Available Tools:")
        print("=" * 40)
        for tool_desc in router.get_available_tools():
            print(f"  • {tool_desc}")
        return
    
    # Require query if not listing tools
    if not args.query:
        parser.error("--query/-q is required when not using --list-tools")
    
    # Initialize the reasoning system
    reasoning_system = ToolEnhancedReasoning(args.api_key)
    
    print("🤖 Tool-Enhanced Reasoning Script")
    print("=" * 50)
    
    # Process the query
    result = reasoning_system.process_query(args.query, verbose=args.verbose)
    
    # Format and display results
    show_reasoning = not args.no_reasoning
    formatted_output = reasoning_system.format_output(result, show_reasoning)
    
    print(formatted_output)
    
    # Exit with appropriate code
    sys.exit(0 if result['success'] else 1)


if __name__ == "__main__":
    main() 