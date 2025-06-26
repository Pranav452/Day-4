"""
Tool router for parsing LLM responses and executing tools.
Maps string-based function calls to actual Python functions.
"""

import re
import ast
from typing import Dict, Any, List, Callable, Optional
from dataclasses import dataclass

# Import all available tools
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from tools.math_tools import calculate_average, square_root, basic_calculator, compare_numbers
from tools.string_tools import count_vowels, count_letters, count_consonants, analyze_string


@dataclass
class ToolCall:
    """Represents a parsed tool call"""
    function_name: str
    parameters: List[Any]
    raw_call: str = ""


@dataclass  
class ToolResult:
    """Represents the result of a tool execution"""
    tool_call: ToolCall
    success: bool
    result: Any = None
    error: Optional[str] = None


class ToolRegistry:
    """Registry of available tools that can be called by the LLM."""
    
    def __init__(self):
        """Initialize the tool registry with all available functions"""
        self.tools: Dict[str, Callable] = {
            'calculate_average': calculate_average,
            'square_root': square_root,
            'basic_calculator': basic_calculator,
            'compare_numbers': compare_numbers,
            'count_vowels': count_vowels,
            'count_letters': count_letters,
            'count_consonants': count_consonants,
            'analyze_string': analyze_string
        }
    
    def get_function(self, name: str) -> Optional[Callable]:
        return self.tools.get(name)
    
    def list_tools(self) -> List[str]:
        return list(self.tools.keys())


class ToolCallParser:
    """Parses tool calls from LLM responses."""
    
    @staticmethod
    def extract_tool_calls(text: str) -> List[str]:
        """Extract tool calls from text using regex patterns."""
        pattern = r'([a-zA-Z_][a-zA-Z0-9_]*\s*\([^)]*\))'
        matches = re.findall(pattern, text)
        return matches
    
    @staticmethod
    def parse_function_call(call_str: str) -> ToolCall:
        """Parse a single function call string into components."""
        call_str = call_str.strip()
        
        match = re.match(r'([a-zA-Z_][a-zA-Z0-9_]*)\s*\((.*)\)', call_str)
        if not match:
            return ToolCall(function_name="", parameters=[], raw_call=call_str)
        
        function_name = match.group(1)
        params_str = match.group(2).strip()
        
        parameters = []
        if params_str:
            try:
                # Simple parameter parsing
                if params_str.startswith('[') and params_str.endswith(']'):
                    # Handle list parameter
                    inner = params_str[1:-1]
                    if inner:
                        items = [float(x.strip()) for x in inner.split(',')]
                        parameters = [items]
                elif ',' in params_str:
                    # Multiple parameters
                    parts = params_str.split(',')
                    for part in parts:
                        part = part.strip()
                        if part.startswith('"') and part.endswith('"'):
                            parameters.append(part[1:-1])
                        elif part.startswith("'") and part.endswith("'"):
                            parameters.append(part[1:-1])
                        else:
                            try:
                                parameters.append(float(part))
                            except:
                                parameters.append(part)
                else:
                    # Single parameter
                    if params_str.startswith('"') and params_str.endswith('"'):
                        parameters.append(params_str[1:-1])
                    elif params_str.startswith("'") and params_str.endswith("'"):
                        parameters.append(params_str[1:-1])
                    else:
                        try:
                            parameters.append(float(params_str))
                        except:
                            parameters.append(params_str)
            except Exception:
                parameters = [params_str]
        
        return ToolCall(
            function_name=function_name,
            parameters=parameters,
            raw_call=call_str
        )


class ToolRouter:
    """Main router that handles tool call parsing and execution."""
    
    def __init__(self):
        """Initialize tool router with registry and parser"""
        self.registry = ToolRegistry()
        self.parser = ToolCallParser()
    
    def parse_tools_from_response(self, llm_response: str) -> List[ToolCall]:
        """Parse tool calls from LLM response."""
        tools_section = self._extract_tools_section(llm_response)
        
        if not tools_section or tools_section.lower().strip() == "none":
            return []
        
        raw_calls = self.parser.extract_tool_calls(tools_section)
        
        tool_calls = []
        for raw_call in raw_calls:
            parsed_call = self.parser.parse_function_call(raw_call)
            if parsed_call.function_name:
                tool_calls.append(parsed_call)
        
        return tool_calls
    
    def execute_tool_call(self, tool_call: ToolCall) -> ToolResult:
        """Execute a single tool call."""
        func = self.registry.get_function(tool_call.function_name)
        if not func:
            return ToolResult(
                tool_call=tool_call,
                success=False,
                error=f"Unknown function: {tool_call.function_name}"
            )
        
        try:
            result = func(*tool_call.parameters)
            return ToolResult(
                tool_call=tool_call,
                success=True,
                result=result
            )
        except Exception as e:
            return ToolResult(
                tool_call=tool_call,
                success=False,
                error=f"Execution error: {str(e)}"
            )
    
    def execute_all_tools(self, tool_calls: List[ToolCall]) -> Dict[str, ToolResult]:
        """Execute all tool calls and return results."""
        results = {}
        for i, tool_call in enumerate(tool_calls):
            result = self.execute_tool_call(tool_call)
            key = f"{tool_call.function_name}_{i}" if len(tool_calls) > 1 else tool_call.function_name
            results[key] = result
        
        return results
    
    def get_available_tools(self) -> List[str]:
        """Get list of available tools with descriptions"""
        descriptions = []
        for name, func in self.registry.tools.items():
            doc = func.__doc__ or f"{name}(...)"
            # Find the first non-empty line that looks like a description
            lines = doc.split('\n')
            description = ""
            for line in lines:
                line = line.strip()
                if line and not line.startswith('Args:') and not line.startswith('Returns:'):
                    description = line
                    break
            if not description:
                description = f"{name}(...)"
            descriptions.append(f"{name}: {description}")
        return descriptions
    
    def _extract_tools_section(self, response: str) -> str:
        """Extract the TOOLS_NEEDED section from LLM response."""
        lines = response.split('\n')
        in_tools_section = False
        tools_content = []
        
        for line in lines:
            line = line.strip()
            if line.startswith('TOOLS_NEEDED:'):
                in_tools_section = True
                content = line.replace('TOOLS_NEEDED:', '').strip()
                if content:
                    tools_content.append(content)
            elif line.startswith('FINAL_ANSWER:'):
                break
            elif in_tools_section and line:
                tools_content.append(line)
        
        return ' '.join(tools_content) 