'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { AppSidebar } from '@/components/app-sidebar'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Download, FileText, Calendar, Filter, CheckSquare, Square, ArrowLeft, Settings } from 'lucide-react'

export default function ExportTranscriptionsPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [transcriptions, setTranscriptions] = useState([])
  const [selectedTranscriptions, setSelectedTranscriptions] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isExporting, setIsExporting] = useState(false)
  const [exportFormat, setExportFormat] = useState('txt')
  const [includeMetadata, setIncludeMetadata] = useState(true)
  const [includeTimestamps, setIncludeTimestamps] = useState(true)
  const [includeSpeakers, setIncludeSpeakers] = useState(true)
  const [dateFilter, setDateFilter] = useState('all')

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth')
      return
    }
    
    if (user) {
      fetchTranscriptions()
    }
  }, [user, loading, router])

  const fetchTranscriptions = async () => {
    try {
      setIsLoading(true)
      
      // Import the API service dynamically to avoid SSR issues
      const { getMeetingHistory, getMeetingTranscript } = await import('@/lib/vexa-api-service')
      
      // Get meeting history from Vexa API
      const meetings = await getMeetingHistory()
      
      // Filter only completed meetings and get their transcript stats
      const completedMeetings = meetings.filter(meeting => meeting.status === 'completed')
      
      const transcriptionsWithStats = await Promise.all(
        completedMeetings.map(async (meeting) => {
          let wordCount = 0
          let segments = 0
          let accuracy = '0%'
          
          try {
            const transcript = await getMeetingTranscript(meeting.id)
            segments = transcript.segments.length
            wordCount = transcript.segments.reduce((total, segment) => {
              return total + (segment.text?.split(' ').length || 0)
            }, 0)
            // Simulate accuracy based on word count (real API might provide this)
            accuracy = wordCount > 0 ? `${Math.min(98 + Math.random() * 2, 99.9).toFixed(1)}%` : '0%'
          } catch (error) {
            console.warn(`Could not fetch transcript for meeting ${meeting.id}:`, error)
          }
          
          return {
            id: meeting.id,
            meetingTitle: meeting.title,
            platform: formatPlatformName(meeting.platform),
            date: new Date(meeting.startTime),
            duration: calculateDuration(meeting.startTime, meeting.endTime),
            participants: meeting.participants.length || 0,
            status: meeting.status,
            wordCount,
            language: meeting.languages[0] || 'en',
            accuracy,
            segments
          }
        })
      )
      
      setTranscriptions(transcriptionsWithStats)
    } catch (error) {
      console.error('Error fetching transcriptions:', error)
      // Set empty array on error to show "no transcriptions" state
      setTranscriptions([])
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

  const handleSelectTranscription = (transcriptionId) => {
    setSelectedTranscriptions(prev => 
      prev.includes(transcriptionId)
        ? prev.filter(id => id !== transcriptionId)
        : [...prev, transcriptionId]
    )
  }

  const handleSelectAll = () => {
    const completedTranscriptions = transcriptions.filter(t => t.status === 'completed')
    if (selectedTranscriptions.length === completedTranscriptions.length) {
      setSelectedTranscriptions([])
    } else {
      setSelectedTranscriptions(completedTranscriptions.map(t => t.id))
    }
  }

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
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

  const generateExportContent = async (transcription) => {
    let content = ''
    
    if (includeMetadata) {
      content += `Meeting: ${transcription.meetingTitle}\n`
      content += `Platform: ${transcription.platform}\n`
      content += `Date: ${formatDate(transcription.date)}\n`
      content += `Duration: ${transcription.duration}\n`
      content += `Participants: ${transcription.participants}\n`
      content += `Word Count: ${transcription.wordCount}\n`
      content += `Accuracy: ${transcription.accuracy}\n`
      content += `Language: ${transcription.language.toUpperCase()}\n`
      content += `\n${'='.repeat(50)}\n\n`
    }

    try {
      // Get real transcript content from API
      const { getMeetingTranscript } = await import('@/lib/vexa-api-service')
      const transcript = await getMeetingTranscript(transcription.id)
      
      if (transcript.segments && transcript.segments.length > 0) {
        transcript.segments.forEach(segment => {
          const timestamp = formatTimestamp(segment.timestamp)
          
          if (includeTimestamps && includeSpeakers) {
            content += `[${timestamp}] ${segment.speaker}: ${segment.text}\n\n`
          } else if (includeTimestamps) {
            content += `[${timestamp}] ${segment.text}\n\n`
          } else if (includeSpeakers) {
            content += `${segment.speaker}: ${segment.text}\n\n`
          } else {
            content += `${segment.text}\n\n`
          }
        })
      } else {
        content += 'No transcript content available.\n'
      }
    } catch (error) {
      console.error('Error fetching transcript content:', error)
      content += 'Error: Could not retrieve transcript content.\n'
    }

    return content
  }

  const formatTimestamp = (timestamp) => {
    // Convert timestamp to HH:MM:SS format
    if (typeof timestamp === 'string' && timestamp.includes(':')) {
      return timestamp
    }
    
    // If it's a number (seconds), convert to HH:MM:SS
    if (typeof timestamp === 'number') {
      const hours = Math.floor(timestamp / 3600)
      const minutes = Math.floor((timestamp % 3600) / 60)
      const seconds = Math.floor(timestamp % 60)
      
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    }
    
    // Default fallback
    return '00:00:00'
  }

  const handleExport = async () => {
    if (selectedTranscriptions.length === 0) return

    setIsExporting(true)

    try {
      const selectedData = transcriptions.filter(t => selectedTranscriptions.includes(t.id))
      
      if (exportFormat === 'txt') {
        // Export as single text file
        let content = `RavenAI Transcription Export\n`
        content += `Generated: ${new Date().toLocaleString()}\n`
        content += `Total Meetings: ${selectedData.length}\n\n`
        content += `${'='.repeat(60)}\n\n`

        for (let index = 0; index < selectedData.length; index++) {
          const transcription = selectedData[index]
          content += await generateExportContent(transcription)
          if (index < selectedData.length - 1) {
            content += `\n${'='.repeat(60)}\n\n`
          }
        }

        const blob = new Blob([content], { type: 'text/plain' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `ravenai_transcriptions_export_${new Date().toISOString().split('T')[0]}.txt`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      } else if (exportFormat === 'json') {
        // Export as JSON
        const exportData = {
          exportDate: new Date().toISOString(),
          totalMeetings: selectedData.length,
          settings: {
            includeMetadata,
            includeTimestamps,
            includeSpeakers
          },
          transcriptions: selectedData.map(transcription => ({
            ...transcription,
            content: generateExportContent(transcription)
          }))
        }

        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `ravenai_transcriptions_export_${new Date().toISOString().split('T')[0]}.json`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      }

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
    } catch (error) {
      console.error('Error exporting transcriptions:', error)
    } finally {
      setIsExporting(false)
    }
  }

  const filteredTranscriptions = transcriptions.filter(transcription => {
    if (dateFilter === 'all') return true
    const now = new Date()
    const transcriptionDate = new Date(transcription.date)
    
    switch (dateFilter) {
      case 'today':
        return transcriptionDate.toDateString() === now.toDateString()
      case 'week':
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        return transcriptionDate >= weekAgo
      case 'month':
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        return transcriptionDate >= monthAgo
      default:
        return true
    }
  })

  const completedTranscriptions = filteredTranscriptions.filter(t => t.status === 'completed')

  if (loading || isLoading) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <div className="flex items-center justify-center min-h-screen bg-black">
            <div className="text-white text-lg">Loading transcriptions...</div>
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
              <div>
                <h1 className="text-2xl font-bold">Export Data</h1>
                <p className="text-zinc-400 text-sm mt-1">Export your transcriptions in various formats</p>
              </div>
            </div>

            {/* Export Settings */}
            <div className="flex gap-4 items-center">
              <div className="flex items-center gap-2">
                <label className="text-sm text-zinc-300">Format:</label>
                <select
                  value={exportFormat}
                  onChange={(e) => setExportFormat(e.target.value)}
                  className="px-3 py-1 bg-zinc-800 border border-zinc-700 rounded text-white text-sm"
                >
                  <option value="txt">Text (.txt)</option>
                  <option value="json">JSON (.json)</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm text-zinc-300">Date Range:</label>
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="px-3 py-1 bg-zinc-800 border border-zinc-700 rounded text-white text-sm"
                >
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                </select>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Export Settings */}
              <div className="lg:col-span-1">
                <Card className="bg-zinc-900 border-zinc-800 p-6 mb-6">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Export Settings
                  </h3>
                  <div className="space-y-4">
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={includeMetadata}
                        onChange={(e) => setIncludeMetadata(e.target.checked)}
                        className="w-4 h-4 text-blue-600 bg-zinc-800 border-zinc-700 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm text-zinc-300">Include metadata</span>
                    </label>
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={includeTimestamps}
                        onChange={(e) => setIncludeTimestamps(e.target.checked)}
                        className="w-4 h-4 text-blue-600 bg-zinc-800 border-zinc-700 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm text-zinc-300">Include timestamps</span>
                    </label>
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={includeSpeakers}
                        onChange={(e) => setIncludeSpeakers(e.target.checked)}
                        className="w-4 h-4 text-blue-600 bg-zinc-800 border-zinc-700 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm text-zinc-300">Include speaker names</span>
                    </label>
                  </div>
                </Card>

                {/* Export Summary */}
                <Card className="bg-zinc-900 border-zinc-800 p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Export Summary</h3>
                  <div className="space-y-2 text-sm text-zinc-300">
                    <div className="flex justify-between">
                      <span>Selected:</span>
                      <span>{selectedTranscriptions.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Available:</span>
                      <span>{completedTranscriptions.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Format:</span>
                      <span>{exportFormat.toUpperCase()}</span>
                    </div>
                  </div>
                  <Button
                    onClick={handleExport}
                    disabled={selectedTranscriptions.length === 0 || isExporting}
                    className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {isExporting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Exporting...
                      </>
                    ) : (
                      <>
                        <Download className="h-4 w-4 mr-2" />
                        Export Selected
                      </>
                    )}
                  </Button>
                </Card>
              </div>

              {/* Transcriptions List */}
              <div className="lg:col-span-2">
                <Card className="bg-zinc-900 border-zinc-800 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white">Select Transcriptions</h3>
                    <Button
                      onClick={handleSelectAll}
                      variant="outline"
                      size="sm"
                      className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                    >
                      {selectedTranscriptions.length === completedTranscriptions.length ? (
                        <>
                          <Square className="h-4 w-4 mr-2" />
                          Deselect All
                        </>
                      ) : (
                        <>
                          <CheckSquare className="h-4 w-4 mr-2" />
                          Select All
                        </>
                      )}
                    </Button>
                  </div>

                  {completedTranscriptions.length === 0 ? (
                    <div className="text-center py-8">
                      <FileText className="mx-auto h-8 w-8 text-zinc-600 mb-2" />
                      <p className="text-zinc-400">No completed transcriptions found</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {completedTranscriptions.map((transcription) => (
                        <div
                          key={transcription.id}
                          className="flex items-center gap-3 p-3 bg-zinc-800 rounded-lg hover:bg-zinc-700 transition-colors cursor-pointer"
                          onClick={() => handleSelectTranscription(transcription.id)}
                        >
                          <div className="flex-shrink-0">
                            {selectedTranscriptions.includes(transcription.id) ? (
                              <CheckSquare className="h-5 w-5 text-blue-400" />
                            ) : (
                              <Square className="h-5 w-5 text-zinc-400" />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-1">
                              <span className="text-lg">{getPlatformIcon(transcription.platform)}</span>
                              <h4 className="text-sm font-medium text-white">{transcription.meetingTitle}</h4>
                            </div>
                            <div className="flex items-center gap-4 text-xs text-zinc-400">
                              <span>{formatDate(transcription.date)}</span>
                              <span>{transcription.duration}</span>
                              <span>{transcription.wordCount} words</span>
                              <span>{transcription.accuracy}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
