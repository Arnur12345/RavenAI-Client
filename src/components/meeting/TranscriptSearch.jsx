'use client'

import React from 'react'

const TranscriptSearch = ({ query, setQuery }) => {
  return (
    <div className="p-3 border-b border-zinc-800 bg-zinc-900/40">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search transcript..."
        className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded text-white text-sm placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-white/10"
      />
    </div>
  )
}

export default TranscriptSearch
