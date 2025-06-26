"""
Chain-of-thought prompting utilities and templates.
Provides structured prompts to guide LLM reasoning.
"""

from typing import List, Dict, Any
from dataclasses import dataclass


@dataclass
class ReasoningStep:
    """Single step in chain-of-thought reasoning"""
    step_number: int
    description: str
    requires_tool: bool = False
    tool_call: str = ""
    result: Any = None


class ChainOfThoughtPrompt:
    """
    Templates and utilities for creating effective chain-of-thought prompts
    that guide the LLM to break down problems systematically.
    """
    
    @staticmethod
    def create_structured_prompt(query: str, available_tools: List[str]) -> str:
        """
        Create a structured prompt that encourages step-by-step reasoning.
        
        Args:
            query: User's natural language query
            available_tools: List of available tool names and descriptions
            
        Returns:
            str: Formatted prompt for chain-of-thought reasoning
        """
        tools_section = "\n".join([f"- {tool}" for tool in available_tools])
        
        prompt = f"""You are an expert problem solver that uses systematic reasoning and external tools when needed.

AVAILABLE TOOLS:
{tools_section}

TASK: {query}

Please solve this step-by-step using the following format:

REASONING:
1. [Break down the problem into logical steps]
2. [Identify what information or calculations are needed]
3. [Determine if any tools are required and why]
4. [Plan the sequence of operations]

TOOLS_NEEDED:
[List specific tool calls needed, or "none" if no tools required]
Format: function_name(parameter1, parameter2, ...)

FINAL_ANSWER:
[Provide final answer or indicate tools need to be executed first]

Guidelines:
- Think step by step before jumping to conclusions
- Use tools for any calculations or text analysis
- Be explicit about your reasoning process
- Provide specific parameters for tool calls
"""
        return prompt
    
    @staticmethod
    def create_follow_up_prompt(query: str, previous_reasoning: str, tool_results: Dict[str, Any]) -> str:
        """
        Create a follow-up prompt after tools have been executed.
        
        Args:
            query: Original query
            previous_reasoning: Previous reasoning steps
            tool_results: Results from executed tools
            
        Returns:
            str: Prompt for final answer generation
        """
        results_section = "\n".join([
            f"- {tool}: {result}" for tool, result in tool_results.items()
        ])
        
        prompt = f"""Original query: {query}

Previous reasoning:
{previous_reasoning}

Tool execution results:
{results_section}

Now provide the final answer based on your reasoning and the tool results:

FINAL_ANSWER:
[Combine your reasoning with tool results to provide the complete answer]
"""
        return prompt
    
    @staticmethod
    def extract_reasoning_components(response: str) -> Dict[str, str]:
        """
        Extract reasoning components from LLM response.
        
        Args:
            response: Raw LLM response
            
        Returns:
            Dict containing extracted components
        """
        components = {
            'reasoning': '',
            'tools_needed': '',
            'final_answer': ''
        }
        
        current_section = None
        lines = response.split('\n')
        
        for line in lines:
            line = line.strip()
            
            if line.startswith('REASONING:'):
                current_section = 'reasoning'
                components['reasoning'] = line.replace('REASONING:', '').strip()
            elif line.startswith('TOOLS_NEEDED:'):
                current_section = 'tools_needed'
                components['tools_needed'] = line.replace('TOOLS_NEEDED:', '').strip()
            elif line.startswith('FINAL_ANSWER:'):
                current_section = 'final_answer'
                components['final_answer'] = line.replace('FINAL_ANSWER:', '').strip()
            elif current_section and line:
                components[current_section] += ' ' + line
        
        # Clean up the components
        for key in components:
            components[key] = components[key].strip()
        
        return components
    
    @staticmethod
    def validate_reasoning_structure(response: str) -> bool:
        """
        Check if the LLM response follows the expected structure.
        
        Args:
            response: LLM response to validate
            
        Returns:
            bool: True if structure is valid
        """
        required_sections = ['REASONING:', 'TOOLS_NEEDED:', 'FINAL_ANSWER:']
        return all(section in response for section in required_sections)


class ReasoningChain:
    """
    Manages a chain of reasoning steps with tool integration.
    """
    
    def __init__(self):
        """Initialize empty reasoning chain"""
        self.steps: List[ReasoningStep] = []
        self.current_step = 0
    
    def add_step(self, description: str, requires_tool: bool = False, tool_call: str = "") -> None:
        """
        Add a reasoning step to the chain.
        
        Args:
            description: Description of the reasoning step
            requires_tool: Whether this step requires tool execution
            tool_call: Tool call string if required
        """
        step = ReasoningStep(
            step_number=len(self.steps) + 1,
            description=description,
            requires_tool=requires_tool,
            tool_call=tool_call
        )
        self.steps.append(step)
    
    def set_step_result(self, step_number: int, result: Any) -> None:
        """
        Set the result for a specific step.
        
        Args:
            step_number: Step number (1-indexed)
            result: Result to set
        """
        if 1 <= step_number <= len(self.steps):
            self.steps[step_number - 1].result = result
    
    def get_tool_requiring_steps(self) -> List[ReasoningStep]:
        """
        Get all steps that require tool execution.
        
        Returns:
            List of steps requiring tools
        """
        return [step for step in self.steps if step.requires_tool]
    
    def is_complete(self) -> bool:
        """
        Check if all tool-requiring steps have results.
        
        Returns:
            bool: True if all tools have been executed
        """
        tool_steps = self.get_tool_requiring_steps()
        return all(step.result is not None for step in tool_steps)
    
    def format_summary(self) -> str:
        """
        Format a summary of the reasoning chain.
        
        Returns:
            str: Formatted summary
        """
        summary = "Reasoning Chain Summary:\n"
        summary += "=" * 30 + "\n"
        
        for step in self.steps:
            summary += f"\n{step.step_number}. {step.description}\n"
            if step.requires_tool:
                summary += f"   Tool: {step.tool_call}\n"
                if step.result is not None:
                    summary += f"   Result: {step.result}\n"
                else:
                    summary += f"   Result: [Pending]\n"
        
        return summary 