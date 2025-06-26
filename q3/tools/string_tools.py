"""
String analysis tools for text processing and counting operations.
Used by the LLM to analyze text and count various characters.
"""

import re
from typing import Dict, List


def count_vowels(text: str, include_y: bool = False) -> int:
    """
    Count the number of vowels in a text string.
    
    Args:
        text: Input text to analyze
        include_y: Whether to include 'y' as a vowel (default: False)
        
    Returns:
        int: Number of vowels found
        
    Example:
        count_vowels("Multimodality") -> 6 (u, i, o, a, i, y not counted)
        count_vowels("Multimodality", include_y=True) -> 7
    """
    vowels = "aeiouAEIOU"
    if include_y:
        vowels += "yY"
    
    return sum(1 for char in text if char in vowels)


def count_letters(text: str) -> int:
    """
    Count the number of alphabetic letters in a text string.
    
    Args:
        text: Input text to analyze
        
    Returns:
        int: Number of letters found
        
    Example:
        count_letters("machine") -> 7
        count_letters("hello, world!") -> 10
    """
    return sum(1 for char in text if char.isalpha())


def count_consonants(text: str, include_y: bool = True) -> int:
    """
    Count the number of consonants in a text string.
    
    Args:
        text: Input text to analyze
        include_y: Whether to include 'y' as a consonant (default: True)
        
    Returns:
        int: Number of consonants found
        
    Example:
        count_consonants("machine") -> 4 (m, c, h, n)
    """
    vowels = "aeiouAEIOU"
    if not include_y:
        vowels += "yY"
    
    return sum(1 for char in text if char.isalpha() and char not in vowels)


def count_words(text: str) -> int:
    """
    Count the number of words in a text string.
    
    Args:
        text: Input text to analyze
        
    Returns:
        int: Number of words found
        
    Example:
        count_words("Hello world") -> 2
    """
    return len(text.split())


def count_characters(text: str, include_spaces: bool = True) -> int:
    """
    Count the total number of characters in a text string.
    
    Args:
        text: Input text to analyze
        include_spaces: Whether to include spaces in the count
        
    Returns:
        int: Number of characters found
        
    Example:
        count_characters("hello") -> 5
        count_characters("hello world", include_spaces=False) -> 10
    """
    if include_spaces:
        return len(text)
    else:
        return len(text.replace(" ", ""))


def analyze_string(text: str) -> Dict[str, int]:
    """
    Perform comprehensive analysis of a text string.
    
    Args:
        text: Input text to analyze
        
    Returns:
        Dict[str, int]: Dictionary with various counts
        
    Example:
        analyze_string("Multimodality") -> {
            'total_chars': 13,
            'letters': 13,
            'vowels': 6,
            'consonants': 7,
            'words': 1,
            'uppercase': 1,
            'lowercase': 12
        }
    """
    return {
        'total_chars': len(text),
        'letters': count_letters(text),
        'vowels': count_vowels(text),
        'consonants': count_consonants(text),
        'words': count_words(text),
        'uppercase': sum(1 for char in text if char.isupper()),
        'lowercase': sum(1 for char in text if char.islower()),
        'digits': sum(1 for char in text if char.isdigit()),
        'spaces': text.count(' '),
        'punctuation': sum(1 for char in text if not char.isalnum() and not char.isspace())
    }


def find_longest_word(text: str) -> str:
    """
    Find the longest word in a text string.
    
    Args:
        text: Input text to analyze
        
    Returns:
        str: The longest word found
        
    Example:
        find_longest_word("The quick brown fox") -> "quick" or "brown"
    """
    words = text.split()
    if not words:
        return ""
    
    return max(words, key=len)


def count_specific_char(text: str, char: str) -> int:
    """
    Count occurrences of a specific character in text.
    
    Args:
        text: Input text to analyze
        char: Character to count
        
    Returns:
        int: Number of occurrences
        
    Example:
        count_specific_char("hello", "l") -> 2
    """
    return text.lower().count(char.lower())


def is_palindrome(text: str) -> bool:
    """
    Check if a text string is a palindrome (ignoring spaces and case).
    
    Args:
        text: Input text to check
        
    Returns:
        bool: True if palindrome, False otherwise
        
    Example:
        is_palindrome("A man a plan a canal Panama") -> True
    """
    # Remove spaces and convert to lowercase for comparison
    cleaned = re.sub(r'[^a-zA-Z0-9]', '', text.lower())
    return cleaned == cleaned[::-1]


def reverse_string(text: str) -> str:
    """
    Reverse a text string.
    
    Args:
        text: Input text to reverse
        
    Returns:
        str: Reversed text
        
    Example:
        reverse_string("hello") -> "olleh"
    """
    return text[::-1] 