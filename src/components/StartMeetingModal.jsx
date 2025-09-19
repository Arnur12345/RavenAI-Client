'use client';

import React, { useState } from 'react';
import { X, Loader2, AlertCircle } from 'lucide-react';

const StartMeetingModal = ({ isOpen, onClose, onStartMeeting }) => {
  const [meetingLink, setMeetingLink] = useState('');
  const [platform, setPlatform] = useState('google_meet');
  const [description, setDescription] = useState('');
  const [botName, setBotName] = useState('RavenAI Bot');
  const [language, setLanguage] = useState('auto');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const platforms = [
    { value: 'google_meet', label: 'Google Meet', pattern: /meet\.google\.com\/(.*?)(\?|$)/ },
    { value: 'microsoft_teams', label: 'Microsoft Teams', pattern: /teams\.microsoft\.com\// },
    { value: 'zoom', label: 'Zoom', pattern: /zoom\.us\// }
  ];

  const languages = [
    { value: 'auto', label: 'Auto-detect' },
    { value: 'en', label: 'English' },
    { value: 'es', label: 'Spanish' },
    { value: 'fr', label: 'French' },
    { value: 'de', label: 'German' },
    { value: 'it', label: 'Italian' },
    { value: 'pt', label: 'Portuguese' },
    { value: 'ru', label: 'Russian' },
    { value: 'ja', label: 'Japanese' },
    { value: 'ko', label: 'Korean' },
    { value: 'zh', label: 'Chinese' }
  ];

  const detectPlatformFromUrl = (url) => {
    for (const platformOption of platforms) {
      if (platformOption.pattern.test(url)) {
        return platformOption.value;
      }
    }
    return 'google_meet'; // Default
  };

  const validateMeetingUrl = (url) => {
    if (!url.trim()) {
      return 'Meeting URL is required';
    }

    // Check if it's a valid URL
    try {
      new URL(url);
    } catch {
      return 'Please enter a valid meeting URL';
    }

    // Check if it matches any supported platform
    const isSupported = platforms.some(platform => platform.pattern.test(url));
    if (!isSupported) {
      return 'Unsupported meeting platform. Please use Google Meet, Microsoft Teams, or Zoom.';
    }

    return null;
  };

  const handleMeetingLinkChange = (e) => {
    const url = e.target.value;
    setMeetingLink(url);
    setError('');
    
    // Auto-detect platform
    if (url.trim()) {
      const detectedPlatform = detectPlatformFromUrl(url);
      setPlatform(detectedPlatform);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationError = validateMeetingUrl(meetingLink);
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const meetingData = {
        meetingUrl: meetingLink.trim(),
        platform,
        description: description.trim(),
        botName: botName.trim() || 'RavenAI Bot',
        language: language === 'auto' ? undefined : language
      };

      await onStartMeeting(meetingData);
      
      // Reset form
      setMeetingLink('');
      setDescription('');
      setBotName('RavenAI Bot');
      setLanguage('auto');
      onClose();
    } catch (err) {
      console.error('Error starting meeting:', err);
      setError(err.message || 'Failed to start meeting. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setError('');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-zinc-900 rounded-xl border border-zinc-800 w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-zinc-800">
          <h2 className="text-xl font-semibold text-white">Start New Meeting</h2>
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="p-1 text-zinc-400 hover:text-white transition-colors disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Meeting URL */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Meeting URL *
            </label>
            <input
              type="url"
              value={meetingLink}
              onChange={handleMeetingLinkChange}
              placeholder="https://meet.google.com/abc-defg-hij"
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-transparent"
              disabled={isLoading}
              required
            />
          </div>

          {/* Platform Selection */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Platform
            </label>
            <select
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-transparent"
              disabled={isLoading}
            >
              {platforms.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of the meeting (optional)"
              rows={3}
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-transparent resize-none"
              disabled={isLoading}
            />
          </div>

          {/* Bot Name */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Bot Name
            </label>
            <input
              type="text"
              value={botName}
              onChange={(e) => setBotName(e.target.value)}
              placeholder="RavenAI Bot"
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-transparent"
              disabled={isLoading}
            />
          </div>

          {/* Language */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Language
            </label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-transparent"
              disabled={isLoading}
            >
              {languages.map((lang) => (
                <option key={lang.value} value={lang.value}>
                  {lang.label}
                </option>
              ))}
            </select>
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-900/20 border border-red-900/30 rounded-lg">
              <AlertCircle size={16} className="text-red-400 flex-shrink-0" />
              <span className="text-red-400 text-sm">{error}</span>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !meetingLink.trim()}
              className="flex-1 px-4 py-2 bg-white text-black font-medium rounded-lg hover:bg-zinc-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Starting...
                </>
              ) : (
                'Start Meeting'
              )}
            </button>
          </div>
        </form>

        {/* Info Note */}
        <div className="px-6 pb-6">
          <div className="p-3 bg-blue-900/20 border border-blue-900/30 rounded-lg">
            <p className="text-blue-400 text-xs">
              <strong>Note:</strong> The bot will request to join your meeting. Please accept the join request to begin transcription.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StartMeetingModal;
