'use client';

import React from 'react';
import { CheckCircle, XCircle, AlertCircle, Copy, RefreshCw } from 'lucide-react';
import Button from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { cn } from '@/lib/utils';

interface ResultDisplayProps {
  result?: string;
  isLoading?: boolean;
  error?: string;
  onRetry?: () => void;
  className?: string;
}

const ResultDisplay: React.FC<ResultDisplayProps> = ({
  result,
  isLoading = false,
  error,
  onRetry,
  className
}) => {
  const copyToClipboard = async () => {
    if (result) {
      try {
        await navigator.clipboard.writeText(result);
      } catch (err) {
        console.error('Failed to copy text: ', err);
      }
    }
  };

  // Loading State
  if (isLoading) {
    return (
      <Card className={cn('', className)} variant="elevated">
        <CardContent className="p-6">
          <div className="flex items-center space-x-3">
            <div className="animate-spin h-6 w-6 border-2 border-blue-500 border-t-transparent rounded-full"></div>
            <div className="space-y-2 flex-1">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Analyzing image...
              </p>
              <div className="space-y-1">
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse w-3/4"></div>
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse w-1/2"></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Error State
  if (error) {
    return (
      <Card className={cn('border-red-200 dark:border-red-800', className)} variant="outlined">
        <CardContent className="p-6">
          <div className="flex items-start space-x-3">
            <XCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1 space-y-2">
              <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                Something went wrong
              </h3>
              <p className="text-sm text-red-600 dark:text-red-400">
                {error}
              </p>
              {onRetry && (
                <Button
                  onClick={onRetry}
                  variant="outline"
                  size="sm"
                  className="mt-3 border-red-300 text-red-700 hover:bg-red-50 dark:border-red-700 dark:text-red-300 dark:hover:bg-red-900/20"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Success State
  if (result) {
    return (
      <Card className={cn('border-green-200 dark:border-green-800', className)} variant="elevated">
        <CardContent className="p-6">
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <h3 className="text-sm font-medium text-green-800 dark:text-green-200">
                  Analysis Complete
                </h3>
              </div>
              <Button
                onClick={copyToClipboard}
                variant="ghost"
                size="sm"
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <Copy className="w-4 h-4 mr-1" />
                Copy
              </Button>
            </div>

            {/* Result Content */}
            <div className="prose prose-sm max-w-none dark:prose-invert">
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 border">
                <p className="text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-wrap">
                  {result}
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-200 dark:border-gray-700">
              <span>Powered by Gemini 1.5 Flash</span>
              <span>{new Date().toLocaleTimeString()}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Empty State
  return (
    <Card className={cn('border-dashed', className)} variant="outlined">
      <CardContent className="p-8 text-center">
        <div className="space-y-3">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto" />
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Ready to analyze
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Upload an image and ask a question to get started
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ResultDisplay; 