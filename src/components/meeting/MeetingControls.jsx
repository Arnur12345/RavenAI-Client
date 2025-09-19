'use client'

import React from 'react'

const MeetingControls = ({
  language,
  languages,
  onLanguageChange,
  isLoading,
  useWebSocket,
  setUseWebSocket
}) => {
  return (
    <div className="p-4 border-b border-zinc-800 bg-zinc-800/50 space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium text-white">Language:</label>
          <select
            value={language}
            onChange={(e) => onLanguageChange(e.target.value)}
            disabled={isLoading}
            className="px-3 py-1 bg-zinc-700 border border-zinc-600 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-white/20"
          >
            {languages.map((lang) => (
              <option key={lang.value} value={lang.value}>
                {lang.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-3">
          <label className="text-sm font-medium text-white">Real-time:</label>
          <button
            onClick={() => setUseWebSocket(!useWebSocket)}
            disabled={isLoading}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
              useWebSocket
                ? 'bg-green-600 text-white hover:bg-green-700'
                : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'
            } disabled:opacity-50`}
          >
            {useWebSocket ? 'WebSocket' : 'Polling'}
          </button>
          <span className="text-xs text-zinc-500">
            {useWebSocket ? 'Live updates (experimental)' : 'Every 3 seconds'}
          </span>
        </div>
      </div>
    </div>
  )
}

export default MeetingControls
