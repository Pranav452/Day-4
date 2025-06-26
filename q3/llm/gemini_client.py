"""
Gemini API client for chain-of-thought reasoning.
Adapted from q2's vision implementation for text-only reasoning tasks.
"""

import os
import json
import asyncio
import aiohttp
from typing import Dict, Any, Optional
from dataclasses import dataclass


@dataclass
class ReasoningResponse:
    """Response structure for reasoning queries"""
    success: bool
    reasoning: str = ""
    tools_needed: str = ""
    final_answer: str = ""
    error: Optional[str] = None
    raw_response: Optional[str] = None


class GeminiReasoningClient:
    """
    Gemini API client specifically designed for tool-enhanced reasoning tasks.
    Uses structured prompts to get chain-of-thought reasoning with tool recommendations.
    """
    
    def __init__(self, api_key: Optional[str] = None):
        """
        Initialize the Gemini reasoning client.
        
        Args:
            api_key: Gemini API key. If None, will look for GEMINI_API_KEY env var.
        """
        self.api_key = api_key or os.getenv('GEMINI_API_KEY')
        if not self.api_key:
            raise ValueError("Gemini API key not found. Set GEMINI_API_KEY environment variable.")
        
        self.base_url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent"
    
    def create_reasoning_prompt(self, query: str) -> str:
        """
        Create a structured prompt that guides Gemini to provide chain-of-thought reasoning
        and identify when tools are needed.
        
        Args:
            query: Natural language query from user
            
        Returns:
            str: Structured prompt for Gemini
        """
        prompt = f"""You are a helpful assistant that can solve problems step-by-step and use tools when needed.

Available tools:
- calculate_average(numbers): Calculate average of a list of numbers
- square_root(number): Calculate square root of a number  
- basic_calculator(expression): Evaluate mathematical expressions
- compare_numbers(a, b, operator): Compare two numbers (>, <, >=, <=, ==, !=)
- count_vowels(text): Count vowels in text
- count_letters(text): Count letters in text
- count_consonants(text): Count consonants in text
- analyze_string(text): Get comprehensive text analysis

For the query: "{query}"

Please provide your response in this exact format:

REASONING:
[Provide step-by-step reasoning about how to solve this problem]

TOOLS_NEEDED:
[If tools are needed, list them as: function_name(parameters). If no tools needed, write "none"]

FINAL_ANSWER:
[Provide the final answer or indicate that tools need to be executed first]

Remember:
- Break down complex problems into steps
- Identify when calculations or text analysis are needed
- Use specific tool calls with exact parameters
- Be precise about what tools are required
"""
        return prompt
    
    async def call_reasoning_api(self, prompt: str) -> Dict[str, Any]:
        """
        Make async API call to Gemini for reasoning.
        
        Args:
            prompt: Structured reasoning prompt
            
        Returns:
            Dict containing API response
        """
        request_body = {
            "contents": [
                {
                    "parts": [
                        {
                            "text": prompt
                        }
                    ]
                }
            ],
            "generationConfig": {
                "temperature": 0.1,  # Low temperature for consistent reasoning
                "candidateCount": 1,
                "maxOutputTokens": 1000
            }
        }
        
        async with aiohttp.ClientSession() as session:
            try:
                async with session.post(
                    f"{self.base_url}?key={self.api_key}",
                    headers={'Content-Type': 'application/json'},
                    json=request_body
                ) as response:
                    
                    if not response.ok:
                        error_text = await response.text()
                        raise Exception(f"Gemini API error {response.status}: {error_text}")
                    
                    return await response.json()
                    
            except Exception as e:
                raise Exception(f"Failed to call Gemini API: {str(e)}")
    
    def parse_reasoning_response(self, raw_response: str) -> ReasoningResponse:
        """
        Parse Gemini's structured response into components.
        
        Args:
            raw_response: Raw text response from Gemini
            
        Returns:
            ReasoningResponse: Parsed response components
        """
        try:
            # Initialize default values
            reasoning = ""
            tools_needed = "none"
            final_answer = ""
            
            # Split response into sections
            sections = raw_response.split('\n\n')
            current_section = None
            
            for line in raw_response.split('\n'):
                line = line.strip()
                
                if line.startswith('REASONING:'):
                    current_section = 'reasoning'
                    reasoning = line.replace('REASONING:', '').strip()
                elif line.startswith('TOOLS_NEEDED:'):
                    current_section = 'tools'
                    tools_needed = line.replace('TOOLS_NEEDED:', '').strip()
                elif line.startswith('FINAL_ANSWER:'):
                    current_section = 'answer'
                    final_answer = line.replace('FINAL_ANSWER:', '').strip()
                elif current_section and line:
                    if current_section == 'reasoning':
                        reasoning += ' ' + line
                    elif current_section == 'tools':
                        tools_needed += ' ' + line
                    elif current_section == 'answer':
                        final_answer += ' ' + line
            
            return ReasoningResponse(
                success=True,
                reasoning=reasoning.strip(),
                tools_needed=tools_needed.strip(),
                final_answer=final_answer.strip(),
                raw_response=raw_response
            )
            
        except Exception as e:
            return ReasoningResponse(
                success=False,
                error=f"Failed to parse response: {str(e)}",
                raw_response=raw_response
            )
    
    async def reason_async(self, query: str) -> ReasoningResponse:
        """
        Async method to get reasoning response for a query.
        
        Args:
            query: Natural language query
            
        Returns:
            ReasoningResponse: Parsed reasoning response
        """
        try:
            # Create structured prompt
            prompt = self.create_reasoning_prompt(query)
            
            # Call Gemini API
            api_response = await self.call_reasoning_api(prompt)
            
            # Extract text from API response
            if (api_response.get('candidates') and 
                len(api_response['candidates']) > 0 and
                api_response['candidates'][0].get('content') and
                api_response['candidates'][0]['content'].get('parts') and
                len(api_response['candidates'][0]['content']['parts']) > 0):
                
                raw_text = api_response['candidates'][0]['content']['parts'][0]['text']
                
                # Parse the structured response
                return self.parse_reasoning_response(raw_text)
            else:
                return ReasoningResponse(
                    success=False,
                    error="No valid response from Gemini API"
                )
                
        except Exception as e:
            return ReasoningResponse(
                success=False,
                error=f"Reasoning failed: {str(e)}"
            )
    
    def reason(self, query: str) -> ReasoningResponse:
        """
        Synchronous wrapper for reasoning.
        
        Args:
            query: Natural language query
            
        Returns:
            ReasoningResponse: Parsed reasoning response
        """
        try:
            # Run async function in sync context
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            try:
                return loop.run_until_complete(self.reason_async(query))
            finally:
                loop.close()
        except Exception as e:
            return ReasoningResponse(
                success=False,
                error=f"Failed to execute reasoning: {str(e)}"
            ) 