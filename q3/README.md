# 🧠 Tool-Enhanced Reasoning Script

A Python script that combines large language model (LLM) reasoning with external tool calling to solve complex natural language queries. Uses Google Gemini for chain-of-thought reasoning and automatically calls appropriate tools for calculations and text analysis.

## 🎯 Features

- **Chain-of-Thought Reasoning**: Uses Gemini LLM for systematic problem breakdown
- **Automatic Tool Detection**: Parses LLM responses to identify when tools are needed
- **Mathematical Tools**: Square root, averages, calculations, comparisons
- **String Analysis Tools**: Vowel/letter counting, text analysis
- **CLI Interface**: Easy command-line usage with multiple options
- **Structured Output**: Clear reasoning steps, tool usage, and final answers

## 🏗️ Project Structure

```
q3/
├── main.py                    # CLI entry point
├── tools/
│   ├── __init__.py
│   ├── math_tools.py         # Mathematical computation tools
│   └── string_tools.py       # String analysis tools
├── llm/
│   ├── __init__.py
│   └── gemini_client.py      # Gemini API integration
├── reasoning/
│   ├── __init__.py
│   ├── chain_of_thought.py   # CoT prompt templates
│   └── tool_router.py        # Tool parsing and execution
├── requirements.txt          # Python dependencies
├── config.example           # Environment variable template
└── README.md               # This documentation
```

## 🚀 Installation and Setup

### 1. Install Dependencies

```bash
# Navigate to the q3 directory
cd q3

# Install required packages
pip install -r requirements.txt
```

### 2. Get Gemini API Key

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Create a new API key
4. Copy the API key

### 3. Set Environment Variables

```bash
# Option 1: Set environment variable directly
export GEMINI_API_KEY="your_api_key_here"

# Option 2: Create .env file (copy from config.example)
cp config.example .env
# Edit .env and add your actual API key
```

### 4. Verify Installation

```bash
# Test the script with a simple query
python main.py --query "What is 2 + 2?" --verbose

# List available tools
python main.py --list-tools
```

## 🎮 Usage

### Basic Usage

```bash
python main.py --query "Your natural language question here"
```

### Command Line Options

| Option | Description |
|--------|-------------|
| `--query`, `-q` | Natural language query to process (required) |
| `--verbose`, `-v` | Show detailed processing steps |
| `--no-reasoning` | Hide reasoning steps, show only final answer |
| `--api-key` | Provide API key directly (overrides env var) |
| `--list-tools` | List all available tools and exit |

### Examples

```bash
# Basic mathematical query
python main.py --query "What's the square root of the average of 18 and 50?"

# String analysis query
python main.py --query "How many vowels are in the word 'Multimodality'?"

# Comparison query  
python main.py --query "Is the number of letters in 'machine' greater than the number of vowels in 'reasoning'?"

# With verbose output
python main.py --query "Calculate the average of 10, 20, and 30" --verbose

# Compact output (no reasoning steps)
python main.py --query "Count letters in 'hello'" --no-reasoning
```

## 📋 Test Queries and Expected Outputs

### Query 1: Mathematical Calculation

**Query**: `"What's the square root of the average of 18 and 50?"`

**Expected Output**:
```
🔍 Query: What's the square root of the average of 18 and 50?

🧠 LLM Reasoning:
1. I need to calculate the average of 18 and 50 first
2. Then calculate the square root of that result
3. This requires two mathematical operations

🔧 Tools Used:
  • calculate_average: 34.0
  • square_root: 5.830951894845301

✅ Final Answer:
The square root of the average of 18 and 50 is approximately 5.83
```

### Query 2: String Analysis

**Query**: `"How many vowels are in the word 'Multimodality'?"`

**Expected Output**:
```
🔍 Query: How many vowels are in the word 'Multimodality'?

🧠 LLM Reasoning:
I need to count the vowels (a, e, i, o, u) in the word "Multimodality"

🔧 Tools Used:
  • count_vowels: 6

✅ Final Answer:
The word "Multimodality" contains 6 vowels (u, i, o, a, i, y is not counted as a vowel in this case)
```

### Query 3: Complex Comparison

**Query**: `"Is the number of letters in 'machine' greater than the number of vowels in 'reasoning'?"`

**Expected Output**:
```
🔍 Query: Is the number of letters in 'machine' greater than the number of vowels in 'reasoning'?

🧠 LLM Reasoning:
1. Count the letters in 'machine'
2. Count the vowels in 'reasoning'  
3. Compare these two numbers

🔧 Tools Used:
  • count_letters: 7
  • count_vowels: 4
  • compare_numbers: True

✅ Final Answer:
Yes, the number of letters in 'machine' (7) is greater than the number of vowels in 'reasoning' (4)
```

### Query 4: Pure Mathematical

**Query**: `"What is the square root of 144?"`

**Expected Output**:
```
🔍 Query: What is the square root of 144?

🧠 LLM Reasoning:
I need to calculate the square root of 144

🔧 Tools Used:
  • square_root: 12.0

✅ Final Answer:
The square root of 144 is 12
```

### Query 5: Complex String Analysis

**Query**: `"Compare the number of consonants in 'programming' with the number of vowels in 'artificial'"`

**Expected Output**:
```
🔍 Query: Compare the number of consonants in 'programming' with the number of vowels in 'artificial'

🧠 LLM Reasoning:
1. Count consonants in 'programming'
2. Count vowels in 'artificial'
3. Compare these numbers

🔧 Tools Used:
  • count_consonants: 8
  • count_vowels: 4

✅ Final Answer:
The word 'programming' has 8 consonants, while 'artificial' has 4 vowels. Programming has more consonants (8) than artificial has vowels (4)
```

## 🔧 Available Tools

The script includes the following tools that can be automatically called by the LLM:

### Mathematical Tools
- `calculate_average(numbers)` - Calculate arithmetic average of numbers
- `square_root(number)` - Calculate square root  
- `basic_calculator(expression)` - Evaluate mathematical expressions
- `compare_numbers(a, b, operator)` - Compare two numbers (>, <, >=, <=, ==, !=)

### String Analysis Tools  
- `count_vowels(text)` - Count vowels in text (a, e, i, o, u)
- `count_letters(text)` - Count alphabetic letters
- `count_consonants(text)` - Count consonants
- `analyze_string(text)` - Comprehensive text analysis

## 🧠 How Tool Usage Decision Works

The script uses a sophisticated prompting strategy to help the LLM decide when tools are needed:

### Prompt Structure
The LLM receives queries with this structured format:
```
You are a helpful assistant that can solve problems step-by-step and use tools when needed.

Available tools: [tool descriptions]

For the query: "[user query]"

Please provide your response in this exact format:

REASONING:
[Step-by-step reasoning about how to solve this problem]

TOOLS_NEEDED: 
[List specific tool calls needed, or "none" if no tools required]

FINAL_ANSWER:
[Provide final answer or indicate tools need to be executed first]
```

### Decision Logic
1. **LLM Analysis**: Gemini analyzes the query and breaks it down step-by-step
2. **Tool Identification**: The LLM identifies which operations require external tools
3. **String Parsing**: Our tool router parses the LLM response using regex patterns
4. **Function Mapping**: Tool names are mapped to actual Python functions
5. **Execution**: Tools are executed with parsed parameters
6. **Result Integration**: Tool results are fed back to the LLM for final answer generation

### Why This Approach Works
- **Structured Output**: Forces consistent LLM responses that can be parsed reliably
- **Explicit Tool Listing**: LLM knows exactly what tools are available
- **Step-by-Step Reasoning**: Encourages systematic problem breakdown
- **Manual Implementation**: No external frameworks needed, full control over the process

## 🛡️ Error Handling

The script includes comprehensive error handling:

- **API Key Validation**: Checks for valid Gemini API key
- **Tool Execution Errors**: Gracefully handles invalid parameters or tool failures  
- **LLM Response Parsing**: Handles malformed or unexpected LLM responses
- **Network Issues**: Manages API connectivity problems
- **Input Validation**: Validates user queries and parameters

## 🎓 Educational Value

This implementation demonstrates:

- **Manual Tool Calling**: How to implement tool calling without frameworks like LangChain
- **LLM Prompt Engineering**: Effective prompting for structured outputs
- **Chain-of-Thought Reasoning**: Encouraging systematic problem-solving
- **String Parsing**: Robust parsing of LLM outputs for function calls
- **API Integration**: Working with external AI services (Gemini)
- **Software Architecture**: Clean modular design with separation of concerns

## 🔍 Troubleshooting

### Common Issues

1. **"Gemini API key not found"**
   - Ensure GEMINI_API_KEY environment variable is set
   - Check that the API key is valid and active

2. **"Unknown function" errors**
   - Verify the LLM is calling tools with correct names
   - Check that all tools are properly registered in ToolRegistry

3. **Tool parameter errors**
   - Review the parameter parsing logic in ToolCallParser
   - Ensure LLM is providing parameters in expected format

4. **Network connectivity issues**
   - Check internet connection
   - Verify Gemini API service status

### Debug Mode

For detailed debugging, run with verbose flag:
```bash
python main.py --query "your query" --verbose
```

This shows:
- LLM reasoning steps
- Tool parsing details  
- Tool execution results
- Final answer generation

## 🚀 Extending the Script

### Adding New Tools

1. **Create Tool Function**: Add new function to appropriate tools module
2. **Register Tool**: Add to ToolRegistry in `tool_router.py`
3. **Update Prompts**: Add tool description to Gemini prompts
4. **Test**: Verify the LLM can call your tool correctly

### Example: Adding a New Math Tool

```python
# In tools/math_tools.py
def factorial(n: int) -> int:
    """Calculate factorial of a number."""
    if n < 0:
        raise ValueError("Factorial not defined for negative numbers")
    if n <= 1:
        return 1
    return n * factorial(n - 1)

# In reasoning/tool_router.py - ToolRegistry.__init__()
self.tools['factorial'] = factorial
```
