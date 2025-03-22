'use client';

import React, { useState, useRef } from 'react';
import { createWorker } from 'tesseract.js';

export default function Home() {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [extractedText, setExtractedText] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const file = e.dataTransfer?.files[0];
    if (file && file.type.startsWith('image/')) {
      await processImage(file);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await processImage(file);
    }
  };

  const processImage = async (file: File) => {
    setIsLoading(true);
    setImageUrl(URL.createObjectURL(file));

    try {
      const worker = await createWorker('eng');
      const { data: { text } } = await worker.recognize(file);
      setExtractedText(text);
      await worker.terminate();
    } catch (error) {
      console.error('Error extracting text:', error);
      alert('Error extracting text from image. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    if (!extractedText) return;
    
    const blob = new Blob([extractedText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'extracted-text.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-8">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
            Image Text Extractor
          </h1>
          <p className="text-gray-600">Upload an image or drag and drop to extract text</p>
        </div>
        
        <div className="space-y-6">
          <div 
            className={`
              relative border-2 border-dashed rounded-xl p-8
              ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}
              transition-all duration-200 ease-in-out
              flex flex-col items-center justify-center
              min-h-[200px]
            `}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <div className="text-center">
              <button
                onClick={() => fileInputRef.current?.click()}
                className={`
                  px-6 py-3 rounded-full font-medium
                  ${isLoading 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600'}
                  text-white shadow-lg hover:shadow-xl
                  transform transition-all duration-200 ease-in-out
                  ${!isLoading && 'hover:-translate-y-1'}
                `}
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </span>
                ) : 'Choose Image'}
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                className="hidden"
              />
              <p className="mt-2 text-sm text-gray-500">or drag and drop your image here</p>
            </div>
          </div>

          {imageUrl && (
            <div className="border rounded-xl p-6 bg-white shadow-lg transform transition-all duration-300 ease-in-out hover:shadow-xl">
              <img
                src={imageUrl}
                alt="Uploaded image"
                className="max-w-full h-auto mx-auto rounded-lg"
              />
            </div>
          )}

          {extractedText && (
            <div className="space-y-4 animate-fade-in">
              <div className="border rounded-xl p-6 bg-white shadow-lg">
                <h2 className="text-2xl font-semibold mb-4 text-gray-800">Extracted Text</h2>
                <div className="bg-gray-50 rounded-lg p-4 max-h-[400px] overflow-y-auto">
                  <p className="whitespace-pre-wrap text-gray-700 font-mono">{extractedText}</p>
                </div>
              </div>
              
              <div className="flex justify-center">
                <button
                  onClick={handleDownload}
                  className="
                    px-6 py-3 rounded-full
                    bg-gradient-to-r from-green-500 to-emerald-500
                    hover:from-green-600 hover:to-emerald-600
                    text-white font-medium shadow-lg
                    transform transition-all duration-200 ease-in-out
                    hover:-translate-y-1 hover:shadow-xl
                  "
                >
                  Download Text
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
} 