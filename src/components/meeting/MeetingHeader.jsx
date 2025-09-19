'use client'

import React from 'react'
import { Mic, MicOff, Users, Clock, Wifi, WifiOff, Settings, Copy, Download } from 'lucide-react'

const MeetingHeader = ({
  isActive,
  wsConnected,
  useWebSocket,
  meetingInfo,
  participantCount,
  onToggleSettings,
  showSettings,
  onStop,
  isLoading,
  onCopy,
  onExport
}) => {
  return (
    <div className="flex items-center justify-between p-4 border-b border-zinc-800 bg-zinc-900/60 backdrop-blur supports-[backdrop-filter]:bg-zinc-900/40 sticky top-0 z-10 rounded-t-xl">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          {isActive ? (
            <Mic className="text-green-400" size={20} />
          ) : (
            <MicOff className="text-red-400" size={20} />
          )}
          <span className="font-semibold text-white">
            {isActive ? 'Live Transcription' : 'Transcription Stopped'}
          </span>
        </div>
        {isActive && <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>}
      </div>

      <div className="flex items-center gap-2">
        {meetingInfo && (
          <div className="hidden sm:flex items-center gap-4 text-sm text-zinc-400 pr-2 mr-2 border-r border-zinc-800">
            <div className="flex items-center gap-1">
              <Users size={16} />
              <span>{participantCount} speakers</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock size={16} />
              <span>{meetingInfo.platform.replace('_', ' ').toUpperCase()}</span>
            </div>
            <div className="flex items-center gap-1">
              {wsConnected ? (
                <>
                  <Wifi size={16} className="text-green-400" />
                  <span className="text-green-400">Live</span>
                </>
              ) : useWebSocket ? (
                <>
                  <WifiOff size={16} className="text-yellow-400" />
                  <span className="text-yellow-400">Connecting...</span>
                </>
              ) : (
                <>
                  <Clock size={16} className="text-blue-400" />
                  <span className="text-blue-400">Polling</span>
                </>
              )}
            </div>
          </div>
        )}

        <button
          onClick={onCopy}
          className="p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
          title="Copy transcript"
        >
          <Copy size={16} />
        </button>
        <button
          onClick={onExport}
          className="p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
          title="Export transcript"
        >
          <Download size={16} />
        </button>
        <button
          onClick={onToggleSettings}
          className={`p-2 rounded-lg transition-colors ${showSettings ? 'text-white bg-zinc-800' : 'text-zinc-400 hover:text-white hover:bg-zinc-800'}`}
          disabled={isLoading}
          title="Settings"
        >
          <Settings size={16} />
        </button>
        <button
          onClick={onStop}
          disabled={isLoading || !isActive}
          className="ml-1 flex items-center px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
        >
          Stop
        </button>
      </div>
    </div>
  )
}

export default MeetingHeader
