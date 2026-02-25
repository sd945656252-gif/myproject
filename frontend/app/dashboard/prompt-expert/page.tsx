'use client';

import React, { useState, useRef } from 'react';
import { Upload, X, Sparkles, Wand2, Download } from 'lucide-react';
import Image from 'next/image';
import { promptApi } from '@/app/lib/api';

export default function PromptExpertPage() {
  const [activeTab, setActiveTab] = useState<'image-to-text' | 'optimize'>('image-to-text');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [language, setLanguage] = useState('zh');
  const [detailLevel, setDetailLevel] = useState('detailed');
  const [promptText, setPromptText] = useState('');
  const [targetStyle, setTargetStyle] = useState('midjourney');
  const [enhancementLevel, setEnhancementLevel] = useState('moderate');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearImage = () => {
    setUploadedImage(null);
    setImageFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleImageToText = async () => {
    if (!uploadedImage) return;

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('image', imageFile!);
      formData.append('language', language);
      formData.append('detail_level', detailLevel);

      const response = await promptApi.uploadAndAnalyze(formData);
      setResult(response);
    } catch (error) {
      console.error('Error analyzing image:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOptimize = async () => {
    if (!promptText.trim()) return;

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('prompt', promptText);
      formData.append('target_style', targetStyle);
      formData.append('enhancement_level', enhancementLevel);

      const response = await promptApi.optimize(formData);
      setResult(response);
    } catch (error) {
      console.error('Error optimizing prompt:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Prompt Expert</h1>
        <p className="text-gray-600">
          AI-powered prompt engineering: analyze images to generate prompts or optimize existing prompts
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('image-to-text')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'image-to-text'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600'
          }`}
        >
          <span className="flex items-center gap-2">
            <Upload size={16} />
            Image to Text
          </span>
        </button>
        <button
          onClick={() => setActiveTab('optimize')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'optimize'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600'
          }`}
        >
          <span className="flex items-center gap-2">
            <Sparkles size={16} />
            Optimize Prompt
          </span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Panel */}
        <div className="space-y-6">
          {activeTab === 'image-to-text' ? (
            <>
              {/* Image Upload */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                {uploadedImage ? (
                  <div className="relative">
                    <Image
                      src={uploadedImage}
                      alt="Uploaded"
                      width={400}
                      height={300}
                      className="rounded-lg mx-auto"
                    />
                    <button
                      onClick={clearImage}
                      className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <div>
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-600">
                      Click to upload or drag and drop
                    </p>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageUpload}
                      accept="image/*"
                      className="hidden"
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Select Image
                    </button>
                  </div>
                )}
              </div>

              {/* Settings */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Language</label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  >
                    <option value="zh">Chinese</option>
                    <option value="en">English</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Detail Level</label>
                  <select
                    value={detailLevel}
                    onChange={(e) => setDetailLevel(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  >
                    <option value="simple">Simple</option>
                    <option value="detailed">Detailed</option>
                    <option value="full">Full (Maximum Detail)</option>
                  </select>
                </div>
              </div>

              <button
                onClick={handleImageToText}
                disabled={!uploadedImage || loading}
                className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Wand2 size={20} />
                {loading ? 'Analyzing...' : 'Generate Prompt'}
              </button>
            </>
          ) : (
            <>
              {/* Text Input */}
              <div>
                <label className="block text-sm font-medium mb-2">Your Prompt</label>
                <textarea
                  value={promptText}
                  onChange={(e) => setPromptText(e.target.value)}
                  placeholder="Enter your prompt here..."
                  rows={6}
                  className="w-full p-3 border border-gray-300 rounded-lg resize-none"
                />
              </div>

              {/* Settings */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Target Style</label>
                  <select
                    value={targetStyle}
                    onChange={(e) => setTargetStyle(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  >
                    <option value="midjourney">Midjourney</option>
                    <option value="stable_diffusion">Stable Diffusion</option>
                    <option value="dall_e">DALL-E 3</option>
                    <option value="sora">Sora (Video)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Enhancement Level</label>
                  <select
                    value={enhancementLevel}
                    onChange={(e) => setEnhancementLevel(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  >
                    <option value="minimal">Minimal</option>
                    <option value="moderate">Moderate</option>
                    <option value="maximum">Maximum</option>
                  </select>
                </div>
              </div>

              <button
                onClick={handleOptimize}
                disabled={!promptText.trim() || loading}
                className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Sparkles size={20} />
                {loading ? 'Optimizing...' : 'Optimize Prompt'}
              </button>
            </>
          )}
        </div>

        {/* Result Panel */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Result</h2>
          {result ? (
            <div className="space-y-4">
              {result.original_text && (
                <div>
                  <h3 className="text-sm font-medium text-gray-600 mb-2">Original</h3>
                  <p className="p-3 bg-white border border-gray-200 rounded-lg">
                    {result.original_text}
                  </p>
                </div>
              )}

              <div>
                <h3 className="text-sm font-medium text-gray-600 mb-2">
                  {result.original_text ? 'Optimized' : 'Generated'} Prompt
                </h3>
                <p className="p-3 bg-white border border-gray-200 rounded-lg">
                  {result.optimized_text}
                </p>
                <button
                  onClick={() => copyToClipboard(result.optimized_text)}
                  className="mt-2 text-sm text-blue-600 hover:text-blue-700"
                >
                  Copy to Clipboard
                </button>
              </div>

              {result.tags && result.tags.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-600 mb-2">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {result.tags.map((tag: string, index: number) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {result.meta && (
                <div>
                  <h3 className="text-sm font-medium text-gray-600 mb-2">Metadata</h3>
                  <div className="text-sm text-gray-600">
                    {Object.entries(result.meta).map(([key, value]) => (
                      <div key={key}>
                        <strong>{key}:</strong> {value as string}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-12">
              {activeTab === 'image-to-text'
                ? 'Upload an image and click "Generate Prompt" to analyze it'
                : 'Enter a prompt and click "Optimize Prompt" to enhance it'}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
