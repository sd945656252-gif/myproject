'use client';

import React, { useState, useEffect } from 'react';
import { Clock, Search, Filter, Trash2, Download, Eye, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { historyApi } from '@/app/lib/api';

type Task = {
  id: string;
  task_type: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  input_data: any;
  output_data: any;
  created_at: string;
  completed_at: string | null;
  error_message?: string;
};

export default function HistoryPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statistics, setStatistics] = useState<any>(null);
  const [showStatistics, setShowStatistics] = useState(true);

  useEffect(() => {
    loadHistory();
    loadStatistics();
  }, []);

  useEffect(() => {
    filterTasks();
  }, [tasks, searchQuery, statusFilter, typeFilter]);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const result = await historyApi.getHistory();
      setTasks(result.tasks || []);
    } catch (error) {
      console.error('Failed to load history:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStatistics = async () => {
    try {
      const stats = await historyApi.getStatistics();
      setStatistics(stats);
    } catch (error) {
      console.error('Failed to load statistics:', error);
    }
  };

  const filterTasks = () => {
    let filtered = [...tasks];

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(task => task.status === statusFilter);
    }

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(task => task.task_type === typeFilter);
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(task => {
        const prompt = task.input_data?.prompt || '';
        const output = JSON.stringify(task.output_data || {});
        return prompt.toLowerCase().includes(query) || output.toLowerCase().includes(query);
      });
    }

    setFilteredTasks(filtered);
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return;

    try {
      await historyApi.deleteTask(taskId);
      setTasks(tasks.filter(task => task.id !== taskId));
      loadStatistics();
    } catch (error) {
      console.error('Failed to delete task:', error);
      alert('Failed to delete task');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="text-green-500" size={18} />;
      case 'failed':
        return <XCircle className="text-red-500" size={18} />;
      case 'processing':
        return <AlertCircle className="text-yellow-500" size={18} />;
      default:
        return <Clock className="text-gray-400" size={18} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Generation History</h1>
        <p className="text-gray-600">View and manage your AI generation tasks</p>
      </div>

      {/* Statistics Panel */}
      {showStatistics && statistics && (
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Statistics</h2>
            <button
              onClick={() => setShowStatistics(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              ×
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-purple-600">{statistics.total_tasks}</div>
              <div className="text-sm text-gray-600">Total Tasks</div>
            </div>
            <div className="bg-white rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-green-600">{statistics.success_rate.toFixed(1)}%</div>
              <div className="text-sm text-gray-600">Success Rate</div>
            </div>
            <div className="bg-white rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-blue-600">{statistics.recent_7_days}</div>
              <div className="text-sm text-gray-600">Last 7 Days</div>
            </div>
            <div className="bg-white rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-pink-600">{statistics.by_status?.completed || 0}</div>
              <div className="text-sm text-gray-600">Completed</div>
            </div>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search by prompt or output..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="processing">Processing</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>
          </div>
          <div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">All Types</option>
              <option value="image_generation">Image Generation</option>
              <option value="video_generation">Video Generation</option>
              <option value="music_generation">Music Generation</option>
              <option value="tts">Text to Speech</option>
              <option value="prompt_optimization">Prompt Optimization</option>
            </select>
          </div>
        </div>
      </div>

      {/* Task List */}
      {loading ? (
        <div className="text-center py-12">
          <Clock className="animate-spin mx-auto text-gray-400" size={48} />
          <p className="mt-4 text-gray-600">Loading history...</p>
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
          <Clock className="mx-auto text-gray-300" size={64} />
          <p className="mt-4 text-gray-500">No tasks found</p>
          {tasks.length === 0 && (
            <p className="mt-2 text-sm text-gray-400">Start generating content to see your history here</p>
          )}
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Task
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTasks.map((task) => (
                  <tr key={task.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          {getStatusIcon(task.status)}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {task.task_type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </div>
                          <div className="text-sm text-gray-500 truncate max-w-xs">
                            {task.input_data?.prompt || task.input_data?.text || 'No prompt'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(task.status)}`}>
                        {task.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {task.task_type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(task.created_at).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedTask(task)}
                          className="text-purple-600 hover:text-purple-900"
                          title="View Details"
                        >
                          <Eye size={18} />
                        </button>
                        {task.output_data && (
                          <button
                            className="text-green-600 hover:text-green-900"
                            title="Download"
                          >
                            <Download size={18} />
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteTask(task.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Task Detail Modal */}
      {selectedTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold">Task Details</h3>
                <button
                  onClick={() => setSelectedTask(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">Task ID</h4>
                  <p className="text-sm">{selectedTask.id}</p>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">Type</h4>
                  <p className="text-sm">{selectedTask.task_type}</p>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">Status</h4>
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(selectedTask.status)}`}>
                    {selectedTask.status}
                  </span>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">Input</h4>
                  <pre className="text-xs bg-gray-100 p-3 rounded overflow-auto">
                    {JSON.stringify(selectedTask.input_data, null, 2)}
                  </pre>
                </div>

                {selectedTask.output_data && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">Output</h4>
                    <pre className="text-xs bg-gray-100 p-3 rounded overflow-auto">
                      {JSON.stringify(selectedTask.output_data, null, 2)}
                    </pre>
                  </div>
                )}

                {selectedTask.error_message && (
                  <div>
                    <h4 className="text-sm font-medium text-red-500 mb-1">Error</h4>
                    <p className="text-sm text-red-600">{selectedTask.error_message}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">Created</h4>
                    <p className="text-sm">{new Date(selectedTask.created_at).toLocaleString()}</p>
                  </div>
                  {selectedTask.completed_at && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-1">Completed</h4>
                      <p className="text-sm">{new Date(selectedTask.completed_at).toLocaleString()}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
