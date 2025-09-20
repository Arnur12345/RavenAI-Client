'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { AppSidebar } from '@/components/app-sidebar'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ArrowLeft, Calendar, Clock, Users, Mic, Download, Search, Play, Pause, Volume2, VolumeX, Send } from 'lucide-react'
import TaskValidationModal from '@/components/jira/TaskValidationModal'
import { tokenManager } from '@/lib/custom-auth'

export default function MeetingDetailPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const meetingId = decodeURIComponent(params.id)

  const [meeting, setMeeting] = useState(null)
  const [transcript, setTranscript] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredSegments, setFilteredSegments] = useState([])
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [isMuted, setIsMuted] = useState(false)
  const [jiraConfigured, setJiraConfigured] = useState(false)
  const [showJiraModal, setShowJiraModal] = useState(false)
  const [isGeneratingTasks, setIsGeneratingTasks] = useState(false)
  const [generatedTasks, setGeneratedTasks] = useState([])

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth')
      return
    }
    
    if (user && meetingId) {
      fetchMeetingDetails()
      checkJiraConfiguration()
    }
  }, [user, loading, router, meetingId])

  useEffect(() => {
    if (transcript) {
      filterSegments()
    }
  }, [transcript, searchQuery])

  const fetchMeetingDetails = async () => {
    try {
      setIsLoading(true)
      
      // Import the API service dynamically to avoid SSR issues
      const { getMeetingHistory, getMeetingTranscript } = await import('@/lib/vexa-api-service')
      
      // Get meeting history from Vexa API
      const meetings = await getMeetingHistory()
      
      // Find the specific meeting
      const foundMeeting = meetings.find(m => m.id === meetingId)
      
      if (!foundMeeting) {
        throw new Error('Meeting not found')
      }
      
      setMeeting(foundMeeting)
      
      // If meeting is completed, fetch transcript
      if (foundMeeting.status === 'completed') {
        try {
          const transcriptData = await getMeetingTranscript(meetingId)
          setTranscript(transcriptData)
        } catch (error) {
          console.warn('Could not fetch transcript:', error)
        }
      }
    } catch (error) {
      console.error('Error fetching meeting details:', error)
      router.push('/meetings')
    } finally {
      setIsLoading(false)
    }
  }

  const filterSegments = () => {
    if (!transcript || !transcript.segments) {
      setFilteredSegments([])
      return
    }

    if (!searchQuery.trim()) {
      setFilteredSegments(transcript.segments)
      return
    }

    const filtered = transcript.segments.filter(segment =>
      segment.text && segment.text.toLowerCase().includes(searchQuery.toLowerCase())
    )
    setFilteredSegments(filtered)
  }

  const formatPlatformName = (platform) => {
    switch (platform) {
      case 'google_meet':
        return 'Google Meet'
      case 'microsoft_teams':
        return 'Microsoft Teams'
      case 'zoom':
        return 'Zoom'
      default:
        return platform
    }
  }

  const calculateDuration = (startTime, endTime) => {
    if (!endTime) return 'Ongoing'
    
    const start = new Date(startTime)
    const end = new Date(endTime)
    const durationMs = end - start
    const minutes = Math.floor(durationMs / (1000 * 60))
    const hours = Math.floor(minutes / 60)
    
    if (hours > 0) {
      const remainingMinutes = minutes % 60
      return `${hours} hour${hours > 1 ? 's' : ''} ${remainingMinutes} minute${remainingMinutes !== 1 ? 's' : ''}`
    }
    
    return `${minutes} minute${minutes !== 1 ? 's' : ''}`
  }

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatTimestamp = (timestamp) => {
    if (typeof timestamp === 'string' && timestamp.includes(':')) {
      return timestamp
    }
    
    if (typeof timestamp === 'number') {
      const hours = Math.floor(timestamp / 3600)
      const minutes = Math.floor((timestamp % 3600) / 60)
      const seconds = Math.floor(timestamp % 60)
      
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    }
    
    return '00:00:00'
  }

  const getPlatformIcon = (platform) => {
    switch (platform.toLowerCase()) {
      case 'google meet':
        return '🎥'
      case 'zoom':
        return '📹'
      case 'microsoft teams':
        return '👥'
      default:
        return '💼'
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'text-green-400 bg-green-400/10'
      case 'live':
        return 'text-blue-400 bg-blue-400/10'
      case 'failed':
        return 'text-red-400 bg-red-400/10'
      default:
        return 'text-gray-400 bg-gray-400/10'
    }
  }

  const handleExportTranscript = () => {
    if (!transcript || !transcript.segments) return

    const content = `Meeting: ${meeting.title}
Platform: ${formatPlatformName(meeting.platform)}
Date: ${formatDate(new Date(meeting.startTime))}
Duration: ${calculateDuration(meeting.startTime, meeting.endTime)}
Participants: ${meeting.participants.length}

${'='.repeat(50)}

${transcript.segments.map(segment => 
  `[${formatTimestamp(segment.timestamp || segment.startTime)}] ${segment.speaker || 'Unknown'}: ${segment.text}`
).join('\n\n')}`

    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${meeting.title.replace(/\s+/g, '_')}_transcript.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const checkJiraConfiguration = async () => {
    try {
      const token = tokenManager.getToken()
      if (!token) return

      const response = await fetch('/api/jira/credentials', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const result = await response.json()
        setJiraConfigured(!!result.data)
      }
    } catch (error) {
      console.error('Error checking JIRA configuration:', error)
    }
  }

  const handleSendToJira = async () => {
    if (!transcript || !transcript.segments || transcript.segments.length === 0) {
      alert('No transcript available for this meeting.')
      return
    }

    setIsGeneratingTasks(true)
    setShowJiraModal(true)

    try {
      const token = tokenManager.getToken()
      const response = await fetch('/api/jira/generate-tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          meetingId: meetingId,
          meetingTitle: meeting.title
        })
      })

      if (response.ok) {
        const result = await response.json()
        setGeneratedTasks(result.data.tasks)
      } else {
        const error = await response.json()
        alert(`Failed to generate tasks: ${error.error}`)
        setShowJiraModal(false)
      }
    } catch (error) {
      console.error('Error generating JIRA tasks:', error)
      alert('Failed to generate JIRA tasks. Please try again.')
      setShowJiraModal(false)
    } finally {
      setIsGeneratingTasks(false)
    }
  }

  const handleCreateTasks = async (tasks) => {
    try {
      const token = tokenManager.getToken()
      const response = await fetch('/api/jira/create-tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ tasks })
      })

      const result = await response.json()
      return result
    } catch (error) {
      console.error('Error creating JIRA tasks:', error)
      throw error
    }
  }

  if (loading || isLoading) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <div className="flex items-center justify-center min-h-screen bg-black">
            <div className="text-white text-lg">Loading meeting details...</div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    )
  }

  if (!meeting) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <div className="flex items-center justify-center min-h-screen bg-black">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-white mb-2">Meeting not found</h2>
              <p className="text-zinc-400 mb-4">The meeting you're looking for doesn't exist.</p>
              <Button onClick={() => router.push('/meetings')} className="bg-blue-600 hover:bg-blue-700 text-white">
                Back to Meetings
              </Button>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    )
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <div className="min-h-screen bg-black text-white">
          {/* Header */}
          <div className="sticky top-0 z-10 bg-black/80 backdrop-blur-sm border-b border-zinc-800 px-6 py-4">
            <div className="flex items-center gap-4 mb-4">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => router.back()}
                className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">{getPlatformIcon(formatPlatformName(meeting.platform))}</span>
                  <h1 className="text-2xl font-bold">{meeting.title}</h1>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(meeting.status)}`}>
                    {meeting.status}
                  </span>
                </div>
                <p className="text-zinc-400 text-sm">{meeting.notes || 'No description available'}</p>
              </div>
              <div className="flex gap-3">
                {transcript && (
                  <Button 
                    onClick={handleExportTranscript}
                    variant="outline"
                    className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export Transcript
                  </Button>
                )}
                {transcript && jiraConfigured && (
                  <Button 
                    onClick={handleSendToJira}
                    className="bg-orange-600 hover:bg-orange-700 text-white"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Send to JIRA
                  </Button>
                )}
                {transcript && !jiraConfigured && (
                  <Button 
                    onClick={() => router.push('/settings/integrations')}
                    variant="outline"
                    className="border-orange-700 text-orange-300 hover:bg-orange-900/20"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Configure JIRA
                  </Button>
                )}
              </div>
            </div>

            {/* Meeting Info */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="flex items-center gap-2 text-zinc-300">
                <Calendar className="h-4 w-4" />
                <span>{formatDate(new Date(meeting.startTime))}</span>
              </div>
              <div className="flex items-center gap-2 text-zinc-300">
                <Clock className="h-4 w-4" />
                <span>{calculateDuration(meeting.startTime, meeting.endTime)}</span>
              </div>
              <div className="flex items-center gap-2 text-zinc-300">
                <Users className="h-4 w-4" />
                <span>{meeting.participants.length} participants</span>
              </div>
              <div className="flex items-center gap-2 text-zinc-300">
                <Mic className="h-4 w-4" />
                <span>{transcript ? `${transcript.segments.length} segments` : 'No transcript'}</span>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {!transcript ? (
              <div className="text-center py-12">
                <Mic className="mx-auto h-12 w-12 text-zinc-600 mb-4" />
                <h3 className="text-lg font-medium text-zinc-300 mb-2">No transcript available</h3>
                <p className="text-zinc-500 mb-4">
                  {meeting.status === 'completed' 
                    ? 'This meeting has ended but no transcript was generated.' 
                    : 'Transcript will be available once the meeting is completed.'
                  }
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Search */}
                <Card className="bg-zinc-900 border-zinc-800 p-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-400" />
                    <Input
                      placeholder="Search transcript..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 bg-zinc-800 border-zinc-700 text-white placeholder-zinc-400"
                    />
                  </div>
                </Card>

                {/* Transcript Segments */}
                <Card className="bg-zinc-900 border-zinc-800 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white">Transcript</h3>
                    <div className="flex items-center gap-2 text-sm text-zinc-400">
                      <span>{filteredSegments.length} of {transcript.segments.length} segments</span>
                    </div>
                  </div>

                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {filteredSegments.length === 0 ? (
                      <div className="text-center py-8">
                        <Search className="mx-auto h-8 w-8 text-zinc-600 mb-2" />
                        <p className="text-zinc-400">No segments found matching your search</p>
                      </div>
                    ) : (
                      filteredSegments.map((segment, index) => (
                        <div key={index} className="bg-zinc-800 rounded-lg p-4 hover:bg-zinc-700 transition-colors">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-blue-400 font-mono">
                              {formatTimestamp(segment.timestamp || segment.startTime)}
                            </span>
                            <span className="text-sm text-zinc-400">
                              {segment.speaker || 'Unknown Speaker'}
                            </span>
                          </div>
                          <p className="text-sm text-zinc-300">{segment.text}</p>
                        </div>
                      ))
                    )}
                  </div>
                </Card>
              </div>
            )}
          </div>
        </div>

        {/* JIRA Task Validation Modal */}
        <TaskValidationModal
          isOpen={showJiraModal}
          onClose={() => {
            setShowJiraModal(false)
            setGeneratedTasks([])
          }}
          initialTasks={generatedTasks}
          onCreateTasks={handleCreateTasks}
          meetingTitle={meeting?.title}
          isLoading={isGeneratingTasks}
        />
      </SidebarInset>
    </SidebarProvider>
  )
}
