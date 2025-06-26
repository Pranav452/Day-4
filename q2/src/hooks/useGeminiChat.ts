'use client';

import { useState, useCallback } from 'react';

interface ChatState {
  result: string | null;
  isLoading: boolean;
  error: string | null;
}

interface ImageData {
  file?: File;
  url?: string;
  preview: string;
}

export const useGeminiChat = () => {
  const [chatState, setChatState] = useState<ChatState>({
    result: null,
    isLoading: false,
    error: null
  });

  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [imageData, setImageData] = useState<ImageData | null>(null);

  const handleImageSelect = useCallback((data: ImageData) => {
    setCurrentImage(data.preview);
    setImageData(data);
    // Clear previous results when new image is selected
    setChatState({
      result: null,
      isLoading: false,
      error: null
    });
  }, []);

  const handleImageClear = useCallback(() => {
    setCurrentImage(null);
    setImageData(null);
    setChatState({
      result: null,
      isLoading: false,
      error: null
    });
  }, []);

  const askQuestion = useCallback(async (question: string) => {
    if (!imageData || !currentImage) {
      setChatState(prev => ({
        ...prev,
        error: 'Please select an image first'
      }));
      return;
    }

    setChatState({
      result: null,
      isLoading: true,
      error: null
    });

    try {
      // Prepare image data for API
      let imageForAPI = currentImage;
      
      // If it's a file, we already have the base64 data
      // If it's a URL, we'll send the URL directly
      if (imageData.file) {
        // The preview is already base64 encoded
        imageForAPI = currentImage;
      } else if (imageData.url) {
        // For URLs, we'll need to fetch and convert to base64
        try {
          const response = await fetch(imageData.url);
          const blob = await response.blob();
          const base64 = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          });
          imageForAPI = base64;
        } catch (fetchError) {
          throw new Error('Failed to fetch image from URL');
        }
      }

      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: imageForAPI,
          question: question.trim()
        })
      });

      const data = await response.json();

      if (data.success) {
        setChatState({
          result: data.data,
          isLoading: false,
          error: null
        });
      } else {
        setChatState({
          result: null,
          isLoading: false,
          error: data.error || 'Failed to analyze image'
        });
      }

    } catch (error) {
      setChatState({
        result: null,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Network error occurred'
      });
    }
  }, [imageData, currentImage]);

  const retry = useCallback(() => {
    setChatState(prev => ({
      ...prev,
      error: null
    }));
  }, []);

  return {
    // State
    result: chatState.result,
    isLoading: chatState.isLoading,
    error: chatState.error,
    currentImage,
    hasImage: !!currentImage,
    
    // Actions
    handleImageSelect,
    handleImageClear,
    askQuestion,
    retry
  };
}; 