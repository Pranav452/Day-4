"""
Math tools for numerical computations and comparisons.
Used by the LLM to perform mathematical operations when reasoning.
"""

import math
from typing import List, Union, Any


def calculate_average(numbers: List[Union[int, float]]) -> float:
    """
    Calculate the arithmetic average of a list of numbers.
    
    Args:
        numbers: List of numbers to average
        
    Returns:
        float: The arithmetic average
        
    Example:
        calculate_average([18, 50]) -> 34.0
    """
    if not numbers:
        raise ValueError("Cannot calculate average of empty list")
    
    return sum(numbers) / len(numbers)


def square_root(number: Union[int, float]) -> float:
    """
    Calculate the square root of a number.
    
    Args:
        number: Number to calculate square root of
        
    Returns:
        float: Square root of the number
        
    Example:
        square_root(34) -> 5.83095189485
    """
    if number < 0:
        raise ValueError("Cannot calculate square root of negative number")
    
    return math.sqrt(number)


def basic_calculator(expression: str) -> Union[int, float]:
    """
    Evaluate a basic mathematical expression safely.
    
    Args:
        expression: Mathematical expression as string (e.g., "2 + 3 * 4")
        
    Returns:
        Union[int, float]: Result of the calculation
        
    Example:
        basic_calculator("18 + 50") -> 68
    """
    # Only allow safe mathematical operations
    allowed_chars = "0123456789+-*/.() "
    if not all(c in allowed_chars for c in expression):
        raise ValueError("Invalid characters in expression")
    
    try:
        # Use eval safely with restricted globals
        result = eval(expression, {"__builtins__": {}}, {})
        return result
    except Exception as e:
        raise ValueError(f"Cannot evaluate expression: {e}")


def compare_numbers(a: Union[int, float], b: Union[int, float], operator: str) -> bool:
    """
    Compare two numbers using the specified operator.
    
    Args:
        a: First number
        b: Second number
        operator: Comparison operator ('>', '<', '>=', '<=', '==', '!=')
        
    Returns:
        bool: Result of the comparison
        
    Example:
        compare_numbers(7, 4, '>') -> True
    """
    operators = {
        '>': lambda x, y: x > y,
        '<': lambda x, y: x < y,
        '>=': lambda x, y: x >= y,
        '<=': lambda x, y: x <= y,
        '==': lambda x, y: x == y,
        '!=': lambda x, y: x != y
    }
    
    if operator not in operators:
        raise ValueError(f"Invalid operator: {operator}")
    
    return operators[operator](a, b)


def power(base: Union[int, float], exponent: Union[int, float]) -> float:
    """
    Calculate base raised to the power of exponent.
    
    Args:
        base: Base number
        exponent: Exponent
        
    Returns:
        float: Result of base^exponent
        
    Example:
        power(2, 3) -> 8.0
    """
    return math.pow(base, exponent)


def absolute_value(number: Union[int, float]) -> Union[int, float]:
    """
    Calculate the absolute value of a number.
    
    Args:
        number: Input number
        
    Returns:
        Union[int, float]: Absolute value
        
    Example:
        absolute_value(-5) -> 5
    """
    return abs(number)


def round_number(number: Union[int, float], decimals: int = 2) -> float:
    """
    Round a number to specified decimal places.
    
    Args:
        number: Number to round
        decimals: Number of decimal places (default: 2)
        
    Returns:
        float: Rounded number
        
    Example:
        round_number(5.83095189485, 2) -> 5.83
    """
    return round(number, decimals) 