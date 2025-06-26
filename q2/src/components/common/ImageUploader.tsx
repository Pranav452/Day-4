'use client';

import React, { useState, useCallback } from 'react';
import { Upload, X, Image as ImageIcon, Link } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { cn } from '@/lib/utils';

interface ImageUploaderProps {
  onImageSelect: (imageData: { file?: File; url?: string; preview: string }) => void;
  onClear: () => void;
  currentImage?: string;
  className?: string;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({
  onImageSelect,
  onClear,
  currentImage,
  className
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [inputMode, setInputMode] = useState<'upload' | 'url'>('upload');

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFileSelect = (file: File) => {
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        onImageSelect({
          file,
          preview: e.target?.result as string
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleUrlSubmit = () => {
    if (urlInput.trim()) {
      onImageSelect({
        url: urlInput.trim(),
        preview: urlInput.trim()
      });
      setUrlInput('');
    }
  };

  return (
    <div className={cn('w-full', className)}>
      {/* Mode Toggle */}
      <div className="flex space-x-2 mb-4">
        <Button
          variant={inputMode === 'upload' ? 'primary' : 'ghost'}
          size="sm"
          onClick={() => setInputMode('upload')}
        >
          <Upload className="w-4 h-4 mr-2" />
          Upload
        </Button>
        <Button
          variant={inputMode === 'url' ? 'primary' : 'ghost'}
          size="sm"
          onClick={() => setInputMode('url')}
        >
          <Link className="w-4 h-4 mr-2" />
          URL
        </Button>
      </div>

      {/* Current Image Display */}
      {currentImage && (
        <div className="relative mb-4 group">
          <img
            src={currentImage}
            alt="Selected"
            className="w-full h-48 object-cover rounded-lg border-2 border-gray-200 dark:border-gray-600"
          />
          <button
            onClick={onClear}
            className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Upload Mode */}
      {inputMode === 'upload' && !currentImage && (
        <div
          className={cn(
            'relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200',
            dragActive
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
              : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
          )}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            type="file"
            accept="image/*"
            onChange={handleFileInput}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <div className="space-y-4">
            <div className="mx-auto w-12 h-12 text-gray-400">
              <ImageIcon className="w-full h-full" />
            </div>
            <div>
              <p className="text-lg font-medium text-gray-900 dark:text-white">
                Drop your image here
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                or click to browse files
              </p>
            </div>
            <p className="text-xs text-gray-400 dark:text-gray-500">
              Supports: JPG, PNG, GIF, WebP
            </p>
          </div>
        </div>
      )}

      {/* URL Mode */}
      {inputMode === 'url' && !currentImage && (
        <div className="space-y-4">
          <Input
            placeholder="Enter image URL..."
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleUrlSubmit()}
          />
          <Button
            onClick={handleUrlSubmit}
            disabled={!urlInput.trim()}
            className="w-full"
          >
            Load Image
          </Button>
        </div>
      )}
    </div>
  );
};

export default ImageUploader; 