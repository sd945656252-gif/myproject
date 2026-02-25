'use client';

import React, { useState, useEffect } from 'react';
import { Music, Mic, Play, Download, Sparkles, Pause, Volume2 } from 'lucide-react';
import { audioApi } from '@/app/lib/api';

export default function AudioGenerationPage() {
  const [activeTab, setActiveTab] = useState<'music' | 'tts'>('music');
  const [prompt, setPrompt] = useState('');
  const [lyrics, setLyrics] = useState('');
  const [style, setStyle] = useState('pop');
  const [mood, setMood] = useState('upbeat');
  const [duration, setDuration] = useState(180);
  const [text, setText] = useState('');
  const [voice, setVoice] = useState('zh_female_1');
  const [speed, setSpeed] = useState(1.0);
  const [language, setLanguage] = useState('zh');
  const [taskId, setTaskId] = useState<string | null>(null);
  const [taskStatus, setTaskStatus] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [availableVoices, setAvailableVoices] = useState<any[]>([]);
  const [musicStyles, setMusicStyles] = useState<any[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = React.useRef<HTMLAudioElement>(null);

  useEffect(() => {
    loadAvailableOptions();
  }, []);

  const loadAvailableOptions = async () => {
    try {
      const voices = await audioApi.getVoices(language);
      setAvailableVoices(voices.voices);

      const styles = await audioApi.getMusicStyles();
      setMusicStyles(styles.styles);
    } catch (error) {
      console.error('Failed to load options:', error);
    }
  };

  const handleGenerateMusic = async () => {
    if (!prompt.trim()) return;

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('prompt', prompt);
      formData.append('style', style);
      formData.append('mood', mood);
      formData.append('duration', duration.toString());

      if (lyrics.trim()) {
        formData.append('lyrics', lyrics);
      }

      const response = await audioApi.generateMusic(formData);
      setTaskId(response.task_id);
      pollTaskStatus(response.task_id);
    } catch (error) {
      console.error('Music generation error:', error);
      setLoading(false);
    }
  };

  const handleTTS = async () => {
    if (!text.trim()) return;

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('text', text);
      formData.append('voice', voice);
      formData.append('speed', speed.toString());
      formData.append('language', language);

      const response = await audioApi.tts(formData);
      setTaskId(response.task_id);
      pollTaskStatus(response.task_id);
    } catch (error) {
      console.error('TTS error:', error);
      setLoading(false);
    }
  };

  const pollTaskStatus = async (taskId: string) => {
    const pollInterval = setInterval(async () => {
      try {
        const status = await audioApi.getTaskStatus(taskId);
        setTaskStatus(status);
        if (status.status === 'completed') {
          setLoading(false);
          clearInterval(pollInterval);
        } else if (status.status === 'failed') {
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

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const downloadAudio = (url: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = `audio-${taskId}.mp3`;
    link.click();
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">AI Audio Generation</h1>
        <p className="text-gray-600">
          Generate music and convert text to speech using AI
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('music')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'music'
              ? 'border-b-2 border-purple-600 text-purple-600'
              : 'text-gray-600'
          }`}
        >
          <span className="flex items-center gap-2">
            <Music size={16} />
            Music Generation
          </span>
        </button>
        <button
          onClick={() => setActiveTab('tts')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'tts'
              ? 'border-b-2 border-purple-600 text-purple-600'
              : 'text-gray-600'
          }`}
        >
          <span className="flex items-center gap-2">
            <Mic size={16} />
            Text to Speech
          </span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Panel */}
        <div className="space-y-6">
          {activeTab === 'music' ? (
            <>
              {/* Prompt */}
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <label className="block text-sm font-medium mb-2">Music Description</label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe the music you want to create..."
                  rows={4}
                  className="w-full p-2 border border-gray-300 rounded-lg resize-none text-sm"
                />
              </div>

              {/* Lyrics (Optional) */}
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <label className="block text-sm font-medium mb-2">Lyrics (Optional)</label>
                <textarea
                  value={lyrics}
                  onChange={(e) => setLyrics(e.target.value)}
                  placeholder="Enter lyrics if you want to create a song..."
                  rows={4}
                  className="w-full p-2 border border-gray-300 rounded-lg resize-none text-sm"
                />
              </div>

              {/* Settings */}
              <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Style</label>
                  <select
                    value={style}
                    onChange={(e) => setStyle(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  >
                    {musicStyles.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Mood</label>
                  <select
                    value={mood}
                    onChange={(e) => setMood(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  >
                    <option value="upbeat">Upbeat</option>
                    <option value="calm">Calm</option>
                    <option value="energetic">Energetic</option>
                    <option value="melancholic">Melancholic</option>
                    <option value="epic">Epic</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Duration (seconds): {duration}</label>
                  <input
                    type="range"
                    min={30}
                    max={300}
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value))}
                    className="w-full"
                  />
                </div>
              </div>

              <button
                onClick={handleGenerateMusic}
                disabled={!prompt.trim() || loading}
                className="w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium"
              >
                <Sparkles size={20} />
                {loading ? 'Generating...' : 'Generate Music'}
              </button>
            </>
          ) : (
            <>
              {/* Text Input */}
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <label className="block text-sm font-medium mb-2">Text to Speak</label>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Enter the text you want to convert to speech..."
                  rows={6}
                  className="w-full p-2 border border-gray-300 rounded-lg resize-none text-sm"
                />
              </div>

              {/* Settings */}
              <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Language</label>
                  <select
                    value={language}
                    onChange={(e) => {
                      setLanguage(e.target.value);
                      loadAvailableOptions();
                    }}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  >
                    <option value="zh">Chinese</option>
                    <option value="en">English</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Voice</label>
                  <select
                    value={voice}
                    onChange={(e) => setVoice(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  >
                    {availableVoices.map((v) => (
                      <option key={v.id} value={v.id}>{v.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Speed: {speed}x</label>
                  <input
                    type="range"
                    min={0.5}
                    max={2.0}
                    step={0.1}
                    value={speed}
                    onChange={(e) => setSpeed(Number(e.target.value))}
                    className="w-full"
                  />
                </div>
              </div>

              <button
                onClick={handleTTS}
                disabled={!text.trim() || loading}
                className="w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium"
              >
                <Volume2 size={20} />
                {loading ? 'Converting...' : 'Convert to Speech'}
              </button>
            </>
          )}
        </div>

        {/* Result Panel */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Result</h2>
          {taskStatus?.output_data?.audio_url ? (
            <div className="space-y-4">
              <audio
                ref={audioRef}
                src={taskStatus.output_data.audio_url}
                controls
                className="w-full"
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
              />
              <div className="flex gap-2">
                <button
                  onClick={() => downloadAudio(taskStatus.output_data.audio_url)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  <Download size={16} />
                  Download
                </button>
              </div>
              {taskStatus.output_data.metadata && (
                <div className="text-sm text-gray-600 space-y-1">
                  <p>Duration: {taskStatus.output_data.metadata.duration}s</p>
                  <p>Format: {taskStatus.output_data.metadata.format}</p>
                </div>
              )}
            </div>
          ) : loading ? (
            <div className="flex flex-col items-center justify-center h-64">
              <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-4 text-gray-600">
                {activeTab === 'music' ? 'Generating music...' : 'Converting text to speech...'}
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              {activeTab === 'music' ? (
                <Music className="text-gray-300" size={48} />
              ) : (
                <Mic className="text-gray-300" size={48} />
              )}
              <p className="mt-4 text-gray-500">
                {activeTab === 'music'
                  ? 'Enter a description and click "Generate Music"'
                  : 'Enter text and click "Convert to Speech"'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
