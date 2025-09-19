'use client'

import React from 'react'

const TranscriptSegment = ({ segment, getSpeakerColor, formatTimestamp }) => {
  const speaker = segment.speaker || 'Unknown Speaker'
  const initials = speaker
    .split(' ')
    .map((s) => s[0])
    .join('')
    .slice(0, 2)

  return (
    <div className="group">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-zinc-800 text-zinc-300 flex items-center justify-center text-xs border border-zinc-700">
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`font-medium text-sm ${getSpeakerColor(speaker)}`}>
              {speaker}
            </span>
            <span className="text-xs text-zinc-500">
              {formatTimestamp(segment.timestamp)}
            </span>
          </div>
          <div className="bg-zinc-800/40 border border-zinc-800 rounded-lg px-3 py-2">
            <p className="text-white text-sm leading-relaxed">
              {segment.text}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TranscriptSegment
