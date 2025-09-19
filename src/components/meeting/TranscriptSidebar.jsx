'use client'

import React from 'react'

const TranscriptSidebar = ({ meetingInfo, participantCount, wsConnected, useWebSocket }) => {
  if (!meetingInfo) return null

  return (
    <aside className="hidden xl:block w-72 border-l border-zinc-800 bg-zinc-900/40">
      <div className="p-4 border-b border-zinc-800">
        <h3 className="text-white font-semibold">Meeting Details</h3>
        <p className="text-zinc-400 text-sm">{meetingInfo.platform.toUpperCase()}</p>
        <p className="text-zinc-500 text-xs mt-1 break-all">ID: {meetingInfo.id}</p>
      </div>
      <div className="p-4 space-y-2 text-sm text-zinc-300">
        <div className="flex justify-between">
          <span>Speakers</span>
          <span className="text-zinc-400">{participantCount}</span>
        </div>
        <div className="flex justify-between">
          <span>Status</span>
          <span className={wsConnected ? 'text-green-400' : useWebSocket ? 'text-yellow-400' : 'text-blue-400'}>
            {wsConnected ? 'Live' : useWebSocket ? 'Connecting' : 'Polling'}
          </span>
        </div>
      </div>
    </aside>
  )
}

export default TranscriptSidebar
