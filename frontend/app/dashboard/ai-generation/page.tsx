'use client';

import React, { useState } from 'react';
import { Wand2, Sparkles, RefreshCw, Download, Settings, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';
import { imageApi } from '@/app/lib/api';

type GenerationType = 'text-to-image' | 'image-to-image' | 'inpainting' | 'controlnet';

export default function AIGenerationPage() {
  const [generationType, setGenerationType] = useState<GenerationType>('text-to-image');
  const [prompt, setPrompt] = useState('');
  const [negativePrompt, setNegativePrompt] = useState('');
  const [width, setWidth] = useState(1024);
  const [height, setHeight] = useState(1024);
  const [steps, setSteps] = useState(30);
  const [cfgScale, setCfgScale] = useState(7.5);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [taskId, setTaskId] = useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim() && generationType === 'text-to-image') return;
    if (!uploadedImage && ['image-to-image', 'inpainting', 'controlnet'].includes(generationType)) return;

    setLoading(true);
    try {
      let response;
      const formData = new FormData();

      if (generationType === 'text-to-image') {
        formData.append('prompt', prompt);
        if (negativePrompt) formData.append('negative_prompt', negativePrompt);
        formData.append('width', width.toString());
        formData.append('height', height.toString());
        formData.append('steps', steps.toString());
        formData.append('cfg_scale', cfgScale.toString());
        response = await imageApi.textToImage(formData);
      } else {
        formData.append('source_image', fileInputRef.current?.files?.[0] || new Blob());
        formData.append('prompt', prompt);
        if (negativePrompt) formData.append('negative_prompt', negativePrompt);

        if (generationType === 'image-to-image') {
          formData.append('strength', '0.75');
          response = await imageApi.imageToImage(formData);
        } else if (generationType === 'inpainting') {
          response = await imageApi.inpainting(formData);
        } else if (generationType === 'controlnet') {
          formData.append('control_type', 'pose');
          formData.append('control_weight', '1.0');
          response = await imageApi.controlnet(formData);
        }
      }

      if (response.task_id) {
        setTaskId(response.task_id);
        pollTaskStatus(response.task_id);
      }
    } catch (error) {
      console.error('Generation error:', error);
      setLoading(false);
    }
  };

  const pollTaskStatus = async (taskId: string) => {
    const pollInterval = setInterval(async () => {
      try {
        const status = await imageApi.getTaskStatus(taskId);
        if (status.status === 'completed' && status.images) {
          setGeneratedImages(status.images);
          setLoading(false);
          clearInterval(pollInterval);
        } else if (status.status === 'failed') {
          console.error('Generation failed:', status.error);
          setLoading(false);
          clearInterval(pollInterval);
        }
      } catch (error) {
        console.error('Polling error:', error);
        clearInterval(pollInterval);
        setLoading(false);
      }
    }, 3000);
  };

  const handleDownload = (imageUrl: string) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `generated-image-${Date.now()}.png`;
    link.click();
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">AI Image Generation</h1>
        <p className="text-gray-600">
          Generate stunning images using multiple AI providers with intelligent routing
        </p>
      </div>

      {/* Generation Type Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {(['text-to-image', 'image-to-image', 'inpainting', 'controlnet'] as GenerationType[]).map((type) => (
          <button
            key={type}
            onClick={() => setGenerationType(type)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              generationType === type
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {type
              .split('-')
              .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
              .join(' ')}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Control Panel */}
        <div className="lg:col-span-1 space-y-6">
          {/* Prompt Input */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <label className="block text-sm font-medium mb-2">Prompt</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe the image you want to generate..."
              rows={4}
              className="w-full p-2 border border-gray-300 rounded-lg resize-none text-sm"
            />
            <label className="block text-sm font-medium mb-2 mt-4">Negative Prompt</label>
            <textarea
              value={negativePrompt}
              onChange={(e) => setNegativePrompt(e.target.value)}
              placeholder="What to avoid in the image..."
              rows={2}
              className="w-full p-2 border border-gray-300 rounded-lg resize-none text-sm"
            />
          </div>

          {/* Image Upload (for image-based generation) */}
          {['image-to-image', 'inpainting', 'controlnet'].includes(generationType) && (
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <label className="block text-sm font-medium mb-2">Source Image</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-400 transition-colors">
                {uploadedImage ? (
                  <Image
                    src={uploadedImage}
                    alt="Uploaded"
                    width={200}
                    height={150}
                    className="rounded mx-auto"
                  />
                ) : (
                  <div>
                    <ImageIcon className="mx-auto h-8 w-8 text-gray-400" />
                    <p className="mt-2 text-xs text-gray-600">Click to upload</p>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageUpload}
                      accept="image/*"
                      className="hidden"
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="mt-2 px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200"
                    >
                      Select Image
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Advanced Settings */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-4">
              <Settings size={16} />
              <h3 className="text-sm font-medium">Advanced Settings</h3>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium mb-1">Size</label>
                <select
                  value={`${width}x${height}`}
                  onChange={(e) => {
                    const [w, h] = e.target.value.split('x').map(Number);
                    setWidth(w);
                    setHeight(h);
                  }}
                  className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="512x512">512 x 512</option>
                  <option value="768x768">768 x 768</option>
                  <option value="1024x1024">1024 x 1024</option>
                  <option value="1024x768">1024 x 768 (Landscape)</option>
                  <option value="768x1024">768 x 1024 (Portrait)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Steps: {steps}</label>
                <input
                  type="range"
                  min={10}
                  max={100}
                  value={steps}
                  onChange={(e) => setSteps(Number(e.target.value))}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">CFG Scale: {cfgScale}</label>
                <input
                  type="range"
                  min={1}
                  max={20}
                  step={0.5}
                  value={cfgScale}
                  onChange={(e) => setCfgScale(Number(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium"
          >
            {loading ? (
              <>
                <RefreshCw className="animate-spin" size={20} />
                Generating...
              </>
            ) : (
              <>
                <Wand2 size={20} />
                Generate
              </>
            )}
          </button>
        </div>

        {/* Result Panel */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-gray-200 rounded-lg p-6 h-full">
            {generatedImages.length > 0 ? (
              <div>
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Sparkles size={20} />
                  Generated Images
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {generatedImages.map((imageUrl, index) => (
                    <div key={index} className="relative group">
                      <Image
                        src={imageUrl}
                        alt={`Generated ${index + 1}`}
                        width={400}
                        height={400}
                        className="rounded-lg"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <button
                          onClick={() => handleDownload(imageUrl)}
                          className="p-3 bg-white rounded-full hover:bg-gray-100 transition-colors"
                        >
                          <Download className="text-gray-800" size={20} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : loading ? (
              <div className="flex flex-col items-center justify-center h-96">
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  <div className="absolute inset-0 w-16 h-16 border-4 border-purple-600 border-b-transparent rounded-full animate-spin" style={{ animationDirection: 'reverse' }}></div>
                </div>
                <p className="mt-4 text-gray-600">
                  {taskId ? `Processing task: ${taskId.slice(0, 8)}...` : 'Initializing...'}
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-96 text-center">
                <Wand2 className="text-gray-300" size={64} />
                <p className="mt-4 text-gray-500 max-w-md">
                  {generationType === 'text-to-image'
                    ? 'Enter a prompt and click "Generate" to create your first image'
                    : 'Upload an image, enter a prompt, and click "Generate" to transform it'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
