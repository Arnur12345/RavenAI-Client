'use client'

import React, { useState, useEffect } from 'react'
import { 
  Calendar, 
  Clock, 
  Users, 
  Globe, 
  Play, 
  Download, 
  Trash2, 
  Eye, 
  MoreVertical,
  Loader2,
  AlertCircle,
  RefreshCw,
  FileText,
  Video
} from 'lucide-react'

const MeetingHistory = ({ onViewMeeting, onResumeMeeting }) => {
  const [meetings, setMeetings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [refreshing, setRefreshing] = useState(false)
  const [selectedMeeting, setSelectedMeeting] = useState(null)
  const [showActions, setShowActions] = useState(null)

  const fetchMeetings = async () => {
    try {
      setError('')
      const response = await fetch('/api/meetings', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch meetings: ${response.status}`)
      }

      const data = await response.json()
      
      // Transform to our standard format (same as getMeetingHistory)
      const transformedMeetings = data.meetings?.map((meeting) => ({
        id: `${meeting.platform}/${meeting.native_meeting_id}/${meeting.id}`,
        platformId: meeting.platform,
        nativeMeetingId: meeting.native_meeting_id,
        platform: meeting.platform,
        status: meeting.status || "stopped",
        startTime: meeting.start_time || new Date().toISOString(),
        endTime: meeting.end_time,
        title: meeting.data?.name || `Meeting ${meeting.native_meeting_id}`,
        participants: meeting.data?.participants || [],
        languages: meeting.data?.languages || [],
        notes: meeting.data?.notes || ""
      })) || []
      
      setMeetings(transformedMeetings)
    } catch (err) {
      console.error('Error fetching meetings:', err)
      setError(err.message)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchMeetings()
  }, [])

  const handleRefresh = () => {
    setRefreshing(true)
    fetchMeetings()
  }

  const handleDeleteMeeting = async (meetingId) => {
    if (!confirm('Are you sure you want to delete this meeting? This action cannot be undone.')) {
      return
    }

    try {
      const [platform, nativeId] = meetingId.split('/')
      const response = await fetch(`/api/meetings/${platform}/${nativeId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to delete meeting: ${response.status}`)
      }

      // Remove from local state
      setMeetings(prev => prev.filter(m => m.id !== meetingId))
      setShowActions(null)
    } catch (err) {
      console.error('Error deleting meeting:', err)
      setError(err.message)
    }
  }

  const handleExportTranscript = async (meetingId) => {
    try {
      const [platform, nativeId] = meetingId.split('/')
      const response = await fetch(`/api/transcripts/${platform}/${nativeId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch transcript: ${response.status}`)
      }

      const data = await response.json()
      const transcript = data.segments
        ?.map(s => `[${new Date(s.timestamp).toLocaleTimeString()}] ${s.speaker || 'Unknown'}: ${s.text}`)
        .join('\n') || 'No transcript available'

      const blob = new Blob([transcript], { type: 'text/plain;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `transcript-${nativeId}.txt`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Error exporting transcript:', err)
      setError(err.message)
    }
  }

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString)
      const now = new Date()
      const diffMs = now - date
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
      
      if (diffDays === 0) {
        return `Today at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
      } else if (diffDays === 1) {
        return `Yesterday at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
      } else if (diffDays < 7) {
        return `${diffDays} days ago`
      } else {
        return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })
      }
    } catch {
      return 'Unknown date'
    }
  }

  const getPlatformIcon = (platform) => {
    switch (platform) {
      case 'google_meet':
        return <Video className="w-4 h-4 text-blue-400" />
      case 'zoom':
        return <Video className="w-4 h-4 text-blue-500" />
      case 'teams':
        return <Video className="w-4 h-4 text-purple-400" />
      default:
        return <Globe className="w-4 h-4 text-zinc-400" />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-500'
      case 'completed':
        return 'bg-blue-500'
      case 'failed':
        return 'bg-red-500'
      default:
        return 'bg-zinc-500'
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'active':
        return 'Live'
      case 'completed':
        return 'Completed'
      case 'failed':
        return 'Failed'
      default:
        return 'Unknown'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-zinc-400" />
          <span className="text-zinc-400">Loading meeting history...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <AlertCircle className="w-8 h-8 text-red-400 mb-3" />
        <p className="text-red-400 mb-4">{error}</p>
        <button
          onClick={handleRefresh}
          className="flex items-center gap-2 px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Try Again
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Calendar className="w-5 h-5 text-zinc-400" />
          <h3 className="text-lg font-semibold text-white">Meeting History</h3>
          <span className="text-sm text-zinc-500">({meetings.length} meetings)</span>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 px-3 py-1.5 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Meetings List */}
      {meetings.length === 0 ? (
        <div className="text-center py-12">
          <Calendar className="w-16 h-16 text-zinc-600 mx-auto mb-4" />
          <p className="text-zinc-400 mb-2">No meetings found</p>
          <p className="text-sm text-zinc-500">
            Start your first meeting to see it appear here
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {meetings.map((meeting) => (
            <div
              key={meeting.id}
              className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-4 hover:bg-zinc-800/70 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    {getPlatformIcon(meeting.platform)}
                    <h4 className="font-medium text-white truncate">
                      {meeting.name || `${meeting.platform.replace('_', ' ')} Meeting`}
                    </h4>
                    <div className={`w-2 h-2 rounded-full ${getStatusColor(meeting.status)}`}></div>
                    <span className="text-xs text-zinc-400">{getStatusText(meeting.status)}</span>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-zinc-400 mb-3">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{formatDate(meeting.created_at)}</span>
                    </div>
                    {meeting.participants && meeting.participants.length > 0 && (
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        <span>{meeting.participants.length} participants</span>
                      </div>
                    )}
                    {meeting.duration && (
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{Math.floor(meeting.duration / 60)}m</span>
                      </div>
                    )}
                  </div>

                  {meeting.notes && (
                    <p className="text-sm text-zinc-300 line-clamp-2">{meeting.notes}</p>
                  )}
                </div>

                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => onViewMeeting(meeting.id)}
                    className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-700 rounded-lg transition-colors"
                    title="View transcript"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  
                  {meeting.status === 'active' && (
                    <button
                      onClick={() => onResumeMeeting(meeting.id)}
                      className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-700 rounded-lg transition-colors"
                      title="Resume meeting"
                    >
                      <Play className="w-4 h-4" />
                    </button>
                  )}
                  
                  <button
                    onClick={() => handleExportTranscript(meeting.id)}
                    className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-700 rounded-lg transition-colors"
                    title="Export transcript"
                  >
                    <Download className="w-4 h-4" />
                  </button>

                  <div className="relative">
                    <button
                      onClick={() => setShowActions(showActions === meeting.id ? null : meeting.id)}
                      className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-700 rounded-lg transition-colors"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>
                    
                    {showActions === meeting.id && (
                      <div className="absolute right-0 top-full mt-1 bg-zinc-800 border border-zinc-700 rounded-lg shadow-lg z-10">
                        <button
                          onClick={() => {
                            handleDeleteMeeting(meeting.id)
                            setShowActions(null)
                          }}
                          className="flex items-center gap-2 w-full px-3 py-2 text-red-400 hover:bg-red-900/20 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default MeetingHistory
