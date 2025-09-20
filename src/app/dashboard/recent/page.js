'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { AppSidebar } from '@/components/app-sidebar'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Calendar, Clock, Users, Mic, Download, Eye } from 'lucide-react'

export default function RecentMeetingsPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [recentMeetings, setRecentMeetings] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth')
      return
    }
    
    if (user) {
      fetchRecentMeetings()
    }
  }, [user, loading, router])

  const fetchRecentMeetings = async () => {
    try {
      setIsLoading(true)
      
      // Import the API service dynamically to avoid SSR issues
      const { getMeetingHistory } = await import('@/lib/vexa-api-service')
      
      // Get meeting history from Vexa API
      const meetings = await getMeetingHistory()
      
      // Sort by start time (most recent first) and take only the recent ones
      const recentMeetings = meetings
        .sort((a, b) => new Date(b.startTime) - new Date(a.startTime))
        .slice(0, 10) // Show last 10 meetings
        .map(meeting => ({
          id: meeting.id,
          title: meeting.title,
          platform: formatPlatformName(meeting.platform),
          date: new Date(meeting.startTime),
          duration: calculateDuration(meeting.startTime, meeting.endTime),
          participants: meeting.participants.length || 0,
          status: meeting.status,
          transcript: meeting.status === 'completed' ? 'Available' : 'Not Available'
        }))
      
      setRecentMeetings(recentMeetings)
    } catch (error) {
      console.error('Error fetching recent meetings:', error)
      // Set empty array on error to show "no meetings" state
      setRecentMeetings([])
    } finally {
      setIsLoading(false)
    }
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
    const now = new Date()
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours} hours ago`
    if (diffInHours < 48) return 'Yesterday'
    return `${Math.floor(diffInHours / 24)} days ago`
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
        return 'text-green-400'
      case 'live':
        return 'text-blue-400'
      case 'failed':
        return 'text-red-400'
      default:
        return 'text-gray-400'
    }
  }

  const handleExportTranscript = async (meetingId) => {
    try {
      const { getMeetingTranscript } = await import('@/lib/vexa-api-service')
      const transcript = await getMeetingTranscript(meetingId)
      
      if (!transcript || !transcript.segments) {
        alert('No transcript available for this meeting')
        return
      }

      const content = `Meeting Transcript
${'='.repeat(50)}

${transcript.segments.map(segment => 
  `[${segment.timestamp || '00:00:00'}] ${segment.speaker || 'Unknown'}: ${segment.text}`
).join('\n\n')}`

      const blob = new Blob([content], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `meeting_transcript_${meetingId.replace(/[\/\\]/g, '_')}.txt`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error exporting transcript:', error)
      alert('Error exporting transcript. Please try again.')
    }
  }

  if (loading || isLoading) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <div className="flex items-center justify-center min-h-screen bg-black">
            <div className="text-white text-lg">Loading recent meetings...</div>
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
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">Recent Meetings</h1>
                <p className="text-zinc-400 text-sm mt-1">Your latest meeting activity</p>
              </div>
              <Button 
                onClick={fetchRecentMeetings}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Refresh
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {recentMeetings.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="mx-auto h-12 w-12 text-zinc-600 mb-4" />
                <h3 className="text-lg font-medium text-zinc-300 mb-2">No recent meetings</h3>
                <p className="text-zinc-500">Your recent meetings will appear here</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {recentMeetings.map((meeting) => (
                  <Card key={meeting.id} className="bg-zinc-900 border-zinc-800 p-6 hover:bg-zinc-800 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <span className="text-2xl">{getPlatformIcon(meeting.platform)}</span>
                          <div>
                            <h3 className="text-lg font-semibold text-white">{meeting.title}</h3>
                            <p className="text-sm text-zinc-400">{meeting.platform}</p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          <div className="flex items-center gap-2 text-sm text-zinc-300">
                            <Clock className="h-4 w-4" />
                            <span>{meeting.duration}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-zinc-300">
                            <Users className="h-4 w-4" />
                            <span>{meeting.participants} participants</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-zinc-300">
                            <Mic className="h-4 w-4" />
                            <span className={getStatusColor(meeting.status)}>{meeting.status}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-zinc-300">
                            <span className="text-xs">{formatDate(meeting.date)}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-2 ml-4">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => router.push(`/meetings/${encodeURIComponent(meeting.id)}`)}
                          className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleExportTranscript(meeting.id)}
                          className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                        >
                          <Download className="h-4 w-4 mr-1" />
                          Export
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
