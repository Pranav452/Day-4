'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Zap } from 'lucide-react';
import Button from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { useAutoComplete } from '@/hooks/useAutoComplete';

interface QuestionBoxProps {
  onSubmit: (question: string) => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}

const QuestionBox: React.FC<QuestionBoxProps> = ({
  onSubmit,
  disabled = false,
  placeholder = "Ask a question about the image...",
  className
}) => {
  const [question, setQuestion] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  const {
    suggestions,
    isLoading: suggestionsLoading,
    selectedIndex,
    showSuggestions,
    getSuggestions,
    navigateSuggestions,
    selectSuggestion,
    hideSuggestions,
    clearSuggestions
  } = useAutoComplete();

  const handleSubmit = () => {
    if (question.trim() && !disabled) {
      onSubmit(question.trim());
      setQuestion('');
      clearSuggestions();
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (showSuggestions && suggestions.length > 0) {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          navigateSuggestions('down');
          break;
        case 'ArrowUp':
          e.preventDefault();
          navigateSuggestions('up');
          break;
        case 'Tab':
        case 'Enter':
          if (selectedIndex >= 0) {
            e.preventDefault();
            const selected = selectSuggestion();
            if (selected) {
              setQuestion(selected);
              adjustTextareaHeight();
            }
          } else if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
          }
          break;
        case 'Escape':
          e.preventDefault();
          hideSuggestions();
          break;
      }
    } else if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setQuestion(value);
    adjustTextareaHeight();
    
    // Get suggestions as user types
    if (value.length > 0) {
      getSuggestions(value);
    } else {
      clearSuggestions();
    }
  };

  const handleSuggestionClick = (suggestion: string, index: number) => {
    const selected = selectSuggestion(index);
    if (selected) {
      setQuestion(selected);
      adjustTextareaHeight();
    }
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        hideSuggestions();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [hideSuggestions]);

  // Example questions for suggestion
  const exampleQuestions = [
    "What objects are in this image?",
    "Describe the scene in detail",
    "What colors are most prominent?",
    "What is the main subject doing?",
    "What text can you see in this image?"
  ];

  return (
    <div className={cn('w-full space-y-4', className)}>
      {/* Example Questions */}
      {!question && !showSuggestions && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
            <Sparkles className="w-4 h-4 mr-2 text-blue-500" />
            Try asking:
          </p>
          <div className="flex flex-wrap gap-2">
            {exampleQuestions.slice(0, 3).map((example, index) => (
              <button
                key={index}
                onClick={() => setQuestion(example)}
                className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-full transition-colors duration-200"
              >
                {example}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Question Input with Auto-complete */}
      <div className="relative" ref={suggestionsRef}>
        <textarea
          ref={textareaRef}
          value={question}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          rows={1}
          className={cn(
            'w-full min-h-[48px] max-h-32 resize-none rounded-lg border border-gray-300 bg-white px-4 py-3 pr-12 text-sm',
            'placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
            'disabled:cursor-not-allowed disabled:opacity-50',
            'dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500',
            'transition-all duration-200',
            showSuggestions && 'rounded-b-none border-b-0'
          )}
          style={{ height: 'auto' }}
        />
        
        {/* Send Button */}
        <Button
          onClick={handleSubmit}
          disabled={!question.trim() || disabled}
          size="sm"
          className="absolute right-2 top-2 h-8 w-8 p-0 rounded-md"
        >
          <Send className="w-4 h-4" />
        </Button>

        {/* Auto-complete Suggestions */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute z-50 w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 border-t-0 rounded-b-lg shadow-lg max-h-48 overflow-y-auto">
            {suggestionsLoading && (
              <div className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400 flex items-center">
                <div className="animate-spin w-3 h-3 border border-blue-500 border-t-transparent rounded-full mr-2"></div>
                Generating suggestions...
              </div>
            )}
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(suggestion, index)}
                className={cn(
                  'w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-150',
                  'focus:outline-none focus:bg-gray-100 dark:focus:bg-gray-700',
                  selectedIndex === index && 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                )}
              >
                <div className="flex items-center">
                  <Zap className="w-3 h-3 mr-2 text-blue-500" />
                  {suggestion}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Character Count and Instructions */}
      <div className="flex justify-between items-center text-xs text-gray-400">
        <div className="flex items-center space-x-4">
          <span>Press Enter to send, Shift+Enter for new line</span>
          {showSuggestions && (
            <span className="text-blue-500 flex items-center">
              <Zap className="w-3 h-3 mr-1" />
              Use ↑↓ to navigate, Tab/Enter to select
            </span>
          )}
        </div>
        <span>{question.length}/500</span>
      </div>
    </div>
  );
};

export default QuestionBox; 