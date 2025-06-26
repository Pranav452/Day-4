'use client';

import { useState, useCallback, useEffect, useRef } from 'react';

interface AutoCompleteState {
  suggestions: string[];
  isLoading: boolean;
  selectedIndex: number;
  showSuggestions: boolean;
}

export const useAutoComplete = () => {
  const [state, setState] = useState<AutoCompleteState>({
    suggestions: [],
    isLoading: false,
    selectedIndex: -1,
    showSuggestions: false
  });

  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Debounced function to fetch suggestions
  const fetchSuggestions = useCallback(async (text: string) => {
    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Don't fetch for very short text
    if (!text || text.length < 3) {
      setState(prev => ({
        ...prev,
        suggestions: [],
        showSuggestions: false,
        isLoading: false
      }));
      return;
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();
    
    setState(prev => ({
      ...prev,
      isLoading: true
    }));

    try {
      const response = await fetch('/api/suggestions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          partial: text.trim(),
          context: 'image-question'
        }),
        signal: abortControllerRef.current.signal
      });

      if (!response.ok) {
        throw new Error('Failed to fetch suggestions');
      }

      const data = await response.json();
      
      if (data.success && Array.isArray(data.suggestions)) {
        setState(prev => ({
          ...prev,
          suggestions: data.suggestions,
          showSuggestions: data.suggestions.length > 0,
          selectedIndex: -1,
          isLoading: false
        }));
      } else {
        setState(prev => ({
          ...prev,
          suggestions: [],
          showSuggestions: false,
          isLoading: false
        }));
      }

    } catch (error) {
      // Ignore abort errors
      if (error instanceof Error && error.name !== 'AbortError') {
        console.error('Auto-complete error:', error);
      }
      setState(prev => ({
        ...prev,
        suggestions: [],
        showSuggestions: false,
        isLoading: false
      }));
    }
  }, []);

  // Debounced suggestion fetcher
  const getSuggestions = useCallback((text: string) => {
    // Clear existing timeout
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Set new timeout for debouncing (300ms delay)
    debounceRef.current = setTimeout(() => {
      fetchSuggestions(text);
    }, 300);
  }, [fetchSuggestions]);

  // Navigate suggestions with keyboard
  const navigateSuggestions = useCallback((direction: 'up' | 'down') => {
    setState(prev => {
      if (!prev.showSuggestions || prev.suggestions.length === 0) {
        return prev;
      }

      let newIndex = prev.selectedIndex;
      
      if (direction === 'down') {
        newIndex = newIndex < prev.suggestions.length - 1 ? newIndex + 1 : -1;
      } else {
        newIndex = newIndex > -1 ? newIndex - 1 : prev.suggestions.length - 1;
      }

      return {
        ...prev,
        selectedIndex: newIndex
      };
    });
  }, []);

  // Select a suggestion
  const selectSuggestion = useCallback((index?: number): string | null => {
    const selectedIndex = index !== undefined ? index : state.selectedIndex;
    
    if (selectedIndex >= 0 && selectedIndex < state.suggestions.length) {
      const selected = state.suggestions[selectedIndex];
      
      // Hide suggestions after selection
      setState(prev => ({
        ...prev,
        showSuggestions: false,
        selectedIndex: -1
      }));
      
      return selected;
    }
    
    return null;
  }, [state.selectedIndex, state.suggestions]);

  // Hide suggestions
  const hideSuggestions = useCallback(() => {
    setState(prev => ({
      ...prev,
      showSuggestions: false,
      selectedIndex: -1
    }));
  }, []);

  // Clear suggestions
  const clearSuggestions = useCallback(() => {
    setState({
      suggestions: [],
      isLoading: false,
      selectedIndex: -1,
      showSuggestions: false
    });
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    suggestions: state.suggestions,
    isLoading: state.isLoading,
    selectedIndex: state.selectedIndex,
    showSuggestions: state.showSuggestions,
    getSuggestions,
    navigateSuggestions,
    selectSuggestion,
    hideSuggestions,
    clearSuggestions
  };
}; 