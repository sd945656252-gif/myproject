'use client';

import React, { useState, useEffect } from 'react';
import { Video, Play, Download, Sparkles, Clock, Filter, Search, Trash2 } from 'lucide-react';
import { videoApi } from '@/app/lib/api';

type VideoTask = {
  id: string;
  task_type: string;
  status: string;
  input_data: any;
  output_data: any;
  created_at: string;
  completed_at: string | null;
};

export default function VideoGenerationPage() {
  const [generationType, setGenerationType] = useState<'text-to-video' | 'image-to-video' | 'video-to-video' | 'upscaling'>('text-to-video');
  const [prompt, setPrompt] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [taskId, setTaskId] = useState<string | null>(null);
  const [taskStatus, setTaskStatus] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<VideoTask[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    setHistoryLoading(true);
    try {
      const result = await videoApi.getTaskStatus(''); // This would need a different API call
      // For now, we'll use history API
      // const response = await historyApi.getByType('video_generation');
      // setHistory(response.tasks || []);
    } catch (error) {
      console.error('Failed to load history:', error);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim() && generationType === 'text-to-video') return;
    if (!uploadedFile && ['image-to-video', 'video-to-video', 'upscaling'].includes(generationType)) return;

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('prompt', prompt);

      if (generationType === 'text-to-video') {
        formData.append('duration', '5');
        formData.append('fps', '24');
        const response = await videoApi.textToVideo(formData);
        setTaskId(response.task_id);
        pollTaskStatus(response.task_id);
      } else if (uploadedFile) {
        formData.append('source_image', uploadedFile);
        formData.append('motion_bucket_id', '127');
        formData.append('duration', '4');
        formData.append('fps', '8');
        const response = await videoApi.imageToVideo(formData);
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
        const status = await videoApi.getTaskStatus(taskId);
        setTaskStatus(status);
        if (status.status === 'completed') {
          setLoading(false);
          clearInterval(pollInterval);
          loadHistory();
        } else if (status.status === 'failed') {
          setLoading(false);
          clearInterval(pollInterval);
        }
      } catch (error) {
        console.error('Polling error:', error);
        clearInterval(pollInterval);
        setLoading(false);
      }
    }, 5000);
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">AI Video Generation</h1>
        <p className="text-gray-600">
          Generate videos using AI models with intelligent routing
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Control Panel */}
        <div className="lg:col-span-1 space-y-6">
          {/* Generation Type */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <label className="block text-sm font-medium mb-2">Generation Type</label>
            <select
              value={generationType}
              onChange={(e) => setGenerationType(e.target.value as any)}
              className="w-full p-2 border border-gray-300 rounded-lg"
            >
              <option value="text-to-video">Text to Video</option>
              <option value="image-to-video">Image to Video</option>
              <option value="video-to-video">Video to Video</option>
              <option value="upscaling">Video Upscaling</option>
            </select>
          </div>

          {/* Prompt Input */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <label className="block text-sm font-medium mb-2">Prompt</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe the video you want to generate..."
              rows={4}
              className="w-full p-2 border border-gray-300 rounded-lg resize-none text-sm"
            />
          </div>

          {/* File Upload */}
          {['image-to-video', 'video-to-video', 'upscaling'].includes(generationType) && (
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <label className="block text-sm font-medium mb-2">
                {generationType === 'image-to-video' ? 'Source Image' : 'Source Video'}
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-400 transition-colors">
                {previewUrl ? (
                  <video
                    src={previewUrl}
                    controls
                    className="rounded max-h-40 mx-auto"
                  />
                ) : (
                  <div>
                    <Video className="mx-auto h-8 w-8 text-gray-400" />
                    <p className="mt-2 text-xs text-gray-600">Click to upload</p>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      accept={generationType === 'image-to-video' ? 'image/*' : 'video/*'}
                      className="hidden"
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="mt-2 px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200"
                    >
                      Select File
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium"
          >
            <Sparkles size={20} />
            {loading ? 'Generating...' : 'Generate Video'}
          </button>
        </div>

        {/* Result Panel */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-gray-200 rounded-lg p-6 h-full">
            {taskStatus?.output_data?.video_url ? (
              <div>
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Play size={20} />
                  Generated Video
                </h2>
                <div className="space-y-4">
                  <video
                    src={taskStatus.output_data.video_url}
                    controls
                    className="w-full rounded-lg"
                  />
                  <button
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = taskStatus.output_data.video_url;
                      link.download = `video-${taskId}.mp4`;
                      link.click();
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                  >
                    <Download size={16} />
                    Download Video
                  </button>
                </div>
              </div>
            ) : loading ? (
              <div className="flex flex-col items-center justify-center h-96">
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
                <p className="mt-4 text-gray-600">
                  {taskId ? `Processing task: ${taskId.slice(0, 8)}...` : 'Initializing...'}
                </p>
                <p className="mt-2 text-sm text-gray-500">Video generation may take several minutes</p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-96 text-center">
                <Video className="text-gray-300" size={64} />
                <p className="mt-4 text-gray-500 max-w-md">
                  Enter a prompt or upload a file, then click "Generate Video" to create your video
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* History Section */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Clock size={20} />
          Generation History
        </h2>
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          {history.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No generation history yet</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {history.map((task) => (
                <div key={task.id} className="border rounded-lg p-4">
                  <div className="text-sm text-gray-600 mb-2">{new Date(task.created_at).toLocaleString()}</div>
                  <div className="text-sm mb-2">{task.input_data?.prompt?.slice(0, 50)}...</div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className={`px-2 py-1 rounded ${
                      task.status === 'completed' ? 'bg-green-100 text-green-800' :
                      task.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {task.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
