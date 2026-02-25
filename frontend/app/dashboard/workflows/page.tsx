'use client';

import React, { useState, useEffect } from 'react';
import { Play, Plus, Clock, CheckCircle, FileText, Zap, Settings, Copy } from 'lucide-react';
import { workflowApi } from '@/app/lib/api';

type Workflow = {
  id: string;
  name: string;
  description: string;
  status: string;
  current_step: string;
  created_at: string;
  updated_at: string;
  completed_at?: string;
};

export default function WorkflowsPage() {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newWorkflowName, setNewWorkflowName] = useState('');
  const [newWorkflowDescription, setNewWorkflowDescription] = useState('');

  useEffect(() => {
    loadWorkflows();
  }, []);

  const loadWorkflows = async () => {
    setLoading(true);
    try {
      const result = await workflowApi.getTemplates();
      setWorkflows(result.workflows || []);
    } catch (error) {
      console.error('Failed to load workflows:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateWorkflow = async () => {
    if (!newWorkflowName.trim()) return;

    try {
      const workflow = await workflowApi.create({
        name: newWorkflowName,
        description: newWorkflowDescription,
      });
      setWorkflows([workflow, ...workflows]);
      setShowCreateModal(false);
      setNewWorkflowName('');
      setNewWorkflowDescription('');
    } catch (error) {
      console.error('Failed to create workflow:', error);
      alert('Failed to create workflow');
    }
  };

  const handleRunWorkflow = async (workflowId: string, idea: string) => {
    try {
      const result = await workflowApi.runAllSteps(workflowId, idea);
      setSelectedWorkflow(result.steps.edit);
      loadWorkflows();
    } catch (error) {
      console.error('Failed to run workflow:', error);
      alert('Failed to run workflow');
    }
  };

  const getStepIcon = (step: string) => {
    switch (step) {
      case 'story':
        return <FileText size={16} />;
      case 'script':
        return <FileText size={16} />;
      case 'config':
        return <Settings size={16} />;
      case 'shots':
        return <Zap size={16} />;
      case 'edit':
        return <CheckCircle size={16} />;
      default:
        return <Clock size={16} />;
    }
  };

  const getStepColor = (step: string) => {
    const steps = ['story', 'script', 'config', 'character', 'shots', 'edit'];
    const currentIndex = steps.indexOf(step);
    const colors = [
      'bg-blue-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-orange-500',
      'bg-yellow-500',
      'bg-green-500',
    ];
    return colors[currentIndex] || 'bg-gray-500';
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">One-Click Workflows</h1>
          <p className="text-gray-600">Automated video creation workflows</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
        >
          <Plus size={20} />
          Create Workflow
        </button>
      </div>

      {/* Workflow Templates */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-purple-500 to-pink-500 text-white rounded-lg p-6">
          <div className="flex items-center gap-2 mb-3">
            <Zap size={24} />
            <h3 className="text-xl font-semibold">Quick Start</h3>
          </div>
          <p className="text-sm opacity-90 mb-4">
            Generate a complete video from a simple idea. AI handles story, script, and visuals.
          </p>
          <button
            onClick={() => {
              const idea = prompt('Enter your video idea:');
              if (idea) handleRunWorkflow('quick-start', idea);
            }}
            className="w-full py-2 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-colors"
          >
            Start Now
          </button>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-cyan-500 text-white rounded-lg p-6">
          <div className="flex items-center gap-2 mb-3">
            <FileText size={24} />
            <h3 className="text-xl font-semibold">Story to Video</h3>
          </div>
          <p className="text-sm opacity-90 mb-4">
            Transform your story into a full video with characters and scenes.
          </p>
          <button
            onClick={() => {
              const idea = prompt('Enter your story:');
              if (idea) handleRunWorkflow('story-to-video', idea);
            }}
            className="w-full py-2 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-colors"
          >
            Start Now
          </button>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-red-500 text-white rounded-lg p-6">
          <div className="flex items-center gap-2 mb-3">
            <Play size={24} />
            <h3 className="text-xl font-semibold">Product Video</h3>
          </div>
          <p className="text-sm opacity-90 mb-4">
            Create professional product videos with AI-generated scenes.
          </p>
          <button
            onClick={() => {
              const idea = prompt('Describe your product:');
              if (idea) handleRunWorkflow('product-video', idea);
            }}
            className="w-full py-2 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-colors"
          >
            Start Now
          </button>
        </div>
      </div>

      {/* My Workflows */}
      <div>
        <h2 className="text-xl font-semibold mb-4">My Workflows</h2>
        {loading ? (
          <div className="text-center py-12">
            <Clock className="animate-spin mx-auto text-gray-400" size={48} />
            <p className="mt-4 text-gray-600">Loading workflows...</p>
          </div>
        ) : workflows.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
            <FileText className="mx-auto text-gray-300" size={64} />
            <p className="mt-4 text-gray-500">No workflows yet</p>
            <p className="mt-2 text-sm text-gray-400">Create your first workflow or use a template</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {workflows.map((workflow) => (
              <div key={workflow.id} className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-lg font-semibold">{workflow.name}</h3>
                    <p className="text-sm text-gray-600">{workflow.description}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    workflow.status === 'completed'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {workflow.status}
                  </span>
                </div>

                {/* Progress Steps */}
                <div className="flex items-center gap-2 mb-4">
                  {['story', 'script', 'config', 'character', 'shots', 'edit'].map((step, index) => (
                    <React.Fragment key={step}>
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${
                          index <= ['story', 'script', 'config', 'character', 'shots', 'edit'].indexOf(workflow.current_step)
                            ? getStepColor(step)
                            : 'bg-gray-200 text-gray-400'
                        }`}
                      >
                        {getStepIcon(step)}
                      </div>
                      {index < 5 && (
                        <div
                          className={`h-1 flex-1 ${
                            index < ['story', 'script', 'config', 'character', 'shots', 'edit'].indexOf(workflow.current_step)
                              ? 'bg-purple-500'
                              : 'bg-gray-200'
                          }`}
                        />
                      )}
                    </React.Fragment>
                  ))}
                </div>

                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>Created: {new Date(workflow.created_at).toLocaleDateString()}</span>
                  {workflow.status === 'completed' && (
                    <button
                      onClick={() => setSelectedWorkflow(workflow)}
                      className="text-purple-600 hover:text-purple-700 flex items-center gap-1"
                    >
                      <Copy size={14} />
                      View Results
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-semibold mb-4">Create New Workflow</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input
                  type="text"
                  value={newWorkflowName}
                  onChange={(e) => setNewWorkflowName(e.target.value)}
                  placeholder="Workflow name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={newWorkflowDescription}
                  onChange={(e) => setNewWorkflowDescription(e.target.value)}
                  placeholder="What does this workflow do?"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleCreateWorkflow}
                  disabled={!newWorkflowName.trim()}
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Create
                </button>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
