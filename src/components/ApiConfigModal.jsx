'use client';

import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle, CheckCircle } from 'lucide-react';
import { getApiKey, setApiKey, getApiBaseUrl, setApiBaseUrl } from '@/lib/transcription-service';

const ApiConfigModal = ({ isOpen, onClose }) => {
  const [apiKey, setApiKeyLocal] = useState('');
  const [apiUrl, setApiUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Load current settings when modal opens
  useEffect(() => {
    if (isOpen) {
      const currentKey = getApiKey();
      const currentUrl = getApiBaseUrl();
      
      setApiKeyLocal(currentKey || '');
      setApiUrl(currentUrl || 'https://api.cloud.vexa.ai');
      setError('');
      setSuccess('');
    }
  }, [isOpen]);

  const handleSave = async () => {
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      // Validate inputs
      if (!apiKey.trim()) {
        throw new Error('API Key is required');
      }

      if (!apiUrl.trim()) {
        throw new Error('API URL is required');
      }

      // Validate URL format
      try {
        new URL(apiUrl);
      } catch {
        throw new Error('Invalid API URL format');
      }

      // Save settings
      setApiKey(apiKey.trim());
      setApiBaseUrl(apiUrl.trim());

      setSuccess('API configuration saved successfully!');
      
      // Close modal after a brief delay
      setTimeout(() => {
        onClose();
      }, 1500);

    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-zinc-900 rounded-xl border border-zinc-800 w-full max-w-lg">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-zinc-800">
          <h2 className="text-xl font-semibold text-white">API Configuration</h2>
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="p-1 text-zinc-400 hover:text-white transition-colors disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* API Key */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Vexa API Key *
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKeyLocal(e.target.value)}
              placeholder="Enter your Vexa API key"
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-transparent"
              disabled={isLoading}
              required
            />
            <p className="text-xs text-zinc-500 mt-1">
              Get your API key from the Vexa platform
            </p>
          </div>

          {/* API URL */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              API Base URL *
            </label>
            <input
              type="url"
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
              placeholder="https://api.cloud.vexa.ai"
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-transparent"
              disabled={isLoading}
              required
            />
            <p className="text-xs text-zinc-500 mt-1">
              The base URL for the Vexa API endpoints
            </p>
          </div>

          {/* Status Messages */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-900/20 border border-red-900/30 rounded-lg">
              <AlertCircle size={16} className="text-red-400 flex-shrink-0" />
              <span className="text-red-400 text-sm">{error}</span>
            </div>
          )}

          {success && (
            <div className="flex items-center gap-2 p-3 bg-green-900/20 border border-green-900/30 rounded-lg">
              <CheckCircle size={16} className="text-green-400 flex-shrink-0" />
              <span className="text-green-400 text-sm">{success}</span>
            </div>
          )}

          {/* Info */}
          <div className="p-3 bg-blue-900/20 border border-blue-900/30 rounded-lg">
            <p className="text-blue-400 text-xs">
              <strong>Note:</strong> Your API configuration is stored locally in your browser. 
              You can also set these values using environment variables:
              <br />
              • <code className="text-blue-300">NEXT_PUBLIC_VEXA_API_KEY</code>
              <br />
              • <code className="text-blue-300">NEXT_PUBLIC_VEXA_API_URL</code>
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 p-6 border-t border-zinc-800">
          <button
            type="button"
            onClick={handleClose}
            disabled={isLoading}
            className="flex-1 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isLoading || !apiKey.trim() || !apiUrl.trim()}
            className="flex-1 px-4 py-2 bg-white text-black font-medium rounded-lg hover:bg-zinc-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save size={16} />
                Save Configuration
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApiConfigModal;
