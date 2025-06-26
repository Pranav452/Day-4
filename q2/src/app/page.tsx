'use client';

import React from 'react';
import { Bot, Sparkles } from 'lucide-react';
import ImageUploader from '@/components/common/ImageUploader';
import QuestionBox from '@/components/common/QuestionBox';
import ResultDisplay from '@/components/common/ResultDisplay';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { useGeminiChat } from '@/hooks/useGeminiChat';

export default function Home() {
  const {
    result,
    isLoading,
    error,
    currentImage,
    hasImage,
    handleImageSelect,
    handleImageClear,
    askQuestion,
    retry
  } = useGeminiChat();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Bot className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              <Sparkles className="w-4 h-4 text-purple-500 absolute -top-1 -right-1" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Multimodal QA Agent
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Powered by Gemini 1.5 Flash
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="space-y-8">
          
          {/* Welcome Section */}
          {!hasImage && !result && (
            <Card variant="elevated" className="text-center">
              <CardContent className="p-8">
                <div className="space-y-4">
                  <div className="w-16 h-16 mx-auto bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                    <Bot className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                      Welcome to Your AI Vision Assistant
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                      Upload any image or provide an image URL, then ask questions about what you see. 
                      Multimodal QA Agent can identify objects, read text, describe scenes, and much more!
                    </p>
                  </div>
                  <div className="flex flex-wrap justify-center gap-2 text-sm">
                    <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full">
                      Object Detection
                    </span>
                    <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full">
                      Text Recognition
                    </span>
                    <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full">
                      Scene Description
                    </span>
                    <span className="px-3 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded-full">
                      Visual Analysis
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Image Upload Section */}
          <Card variant="elevated">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span>📷</span>
                <span>Select Your Image</span>
              </CardTitle>
              <CardDescription>
                Upload an image file or provide a URL to get started
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ImageUploader
                onImageSelect={handleImageSelect}
                onClear={handleImageClear}
                currentImage={currentImage || undefined}
              />
            </CardContent>
          </Card>

          {/* Question Section */}
          {hasImage && (
            <Card variant="elevated">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <span>❓</span>
                  <span>Ask Your Question</span>
                </CardTitle>
                <CardDescription>
                  What would you like to know about this image?
                </CardDescription>
              </CardHeader>
              <CardContent>
                <QuestionBox
                  onSubmit={askQuestion}
                  disabled={isLoading}
                  placeholder="Describe what you see in this image..."
                />
              </CardContent>
            </Card>
          )}

          {/* Results Section */}
          {(result || isLoading || error) && (
            <Card variant="elevated">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <span>🤖</span>
                  <span>AI Analysis</span>
                </CardTitle>
                <CardDescription>
                  Here's what Multimodal QA Agent found in your image
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <ResultDisplay
                  result={result || undefined}
                  isLoading={isLoading}
                  error={error || undefined}
                  onRetry={retry}
                />
              </CardContent>
            </Card>
          )}

          {/* Features Section */}
          {!hasImage && (
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="text-center">
                <CardContent className="p-6">
                  <div className="w-12 h-12 mx-auto bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mb-4">
                    <span className="text-2xl">🔍</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                    Object Detection
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Identify and count objects, people, animals, and items in your images
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardContent className="p-6">
                  <div className="w-12 h-12 mx-auto bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mb-4">
                    <span className="text-2xl">📖</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                    Text Recognition
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Extract and read text from signs, documents, and handwritten notes
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardContent className="p-6">
                  <div className="w-12 h-12 mx-auto bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mb-4">
                    <span className="text-2xl">🎨</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                    Scene Analysis
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Get detailed descriptions of scenes, activities, and visual elements
                  </p>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm border-t border-gray-200 dark:border-gray-700 mt-16">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="text-center text-sm text-gray-600 dark:text-gray-400">
            <p>
              Built with Next.js 15 & Gemini 1.5 Flash • 
              <span className="ml-1 text-blue-600 dark:text-blue-400">
                Experience the future of AI vision
              </span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
