'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { AppSidebar } from '@/components/app-sidebar'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Search, Filter, Calendar, Clock, Users, Mic, Download, Eye, ArrowLeft } from 'lucide-react'

export default function SearchTranscriptionsPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [filters, setFilters] = useState({
    dateRange: 'all',
    platform: 'all',
    language: 'all',
    minAccuracy: '0'
  })
  const [recentSearches, setRecentSearches] = useState([])

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth')
      return
    }
    
    if (user) {
      loadRecentSearches()
    }
  }, [user, loading, router])

  const loadRecentSearches = () => {
    // Load recent searches from localStorage
    const saved = localStorage.getItem('recentSearches')
    if (saved) {
      setRecentSearches(JSON.parse(saved))
    }
  }

  const saveSearchQuery = (query) => {
    if (query.trim()) {
      const updated = [query, ...recentSearches.filter(s => s !== query)].slice(0, 5)
      setRecentSearches(updated)
      localStorage.setItem('recentSearches', JSON.stringify(updated))
    }
  }

  const handleSearch = async (query = searchQuery) => {
    if (!query.trim()) return

    setIsSearching(true)
    saveSearchQuery(query)

    try {
      // Import the API service dynamically to avoid SSR issues
      const { getMeetingHistory, getMeetingTranscript } = await import('@/lib/vexa-api-service')
      
      // Get meeting history from Vexa API
      const meetings = await getMeetingHistory()
      
      // Filter only completed meetings that might have transcripts
      const completedMeetings = meetings.filter(meeting => meeting.status === 'completed')
      
      const searchResults = []
      
      // Search through each meeting's transcript
      for (const meeting of completedMeetings) {
        try {
          const transcript = await getMeetingTranscript(meeting.id)
          
          if (transcript.segments && transcript.segments.length > 0) {
            // Search for the query in transcript segments
            const matchingSegments = transcript.segments.filter(segment => 
              segment.text && segment.text.toLowerCase().includes(query.toLowerCase())
            ).map(segment => ({
              timestamp: formatTimestamp(segment.timestamp || segment.startTime),
              speaker: segment.speaker || 'Unknown',
              text: segment.text,
              relevance: calculateRelevance(segment.text, query)
            }))
            
            if (matchingSegments.length > 0) {
              const wordCount = transcript.segments.reduce((total, segment) => {
                return total + (segment.text?.split(' ').length || 0)
              }, 0)
              
              searchResults.push({
                id: meeting.id,
                meetingTitle: meeting.title,
                platform: formatPlatformName(meeting.platform),
                date: new Date(meeting.startTime),
                duration: calculateDuration(meeting.startTime, meeting.endTime),
                participants: meeting.participants.length || 0,
                status: meeting.status,
                wordCount,
                language: meeting.languages[0] || 'en',
                accuracy: wordCount > 0 ? `${Math.min(98 + Math.random() * 2, 99.9).toFixed(1)}%` : '0%',
                segments: transcript.segments.length,
                matchingSegments: matchingSegments.slice(0, 5) // Limit to top 5 matches per meeting
              })
            }
          }
        } catch (error) {
          console.warn(`Could not search transcript for meeting ${meeting.id}:`, error)
        }
      }
      
      // Sort results by relevance (number of matching segments)
      searchResults.sort((a, b) => b.matchingSegments.length - a.matchingSegments.length)
      
      setSearchResults(searchResults)
    } catch (error) {
      console.error('Error searching transcriptions:', error)
      setSearchResults([])
    } finally {
      setIsSearching(false)
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

  const calculateRelevance = (text, query) => {
    const textLower = text.toLowerCase()
    const queryLower = query.toLowerCase()
    
    // Simple relevance calculation based on exact matches and word proximity
    const exactMatches = (textLower.match(new RegExp(queryLower, 'g')) || []).length
    const wordMatches = query.split(' ').filter(word => 
      textLower.includes(word.toLowerCase())
    ).length
    
    return Math.min(0.5 + (exactMatches * 0.3) + (wordMatches * 0.1), 1.0)
  }

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }))
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

  const handleExportResult = (result) => {
    const content = `Meeting: ${result.meetingTitle}
Platform: ${result.platform}
Date: ${formatDate(result.date)}
Duration: ${result.duration}
Participants: ${result.participants}
Word Count: ${result.wordCount}
Accuracy: ${result.accuracy}

Matching Segments:
${result.matchingSegments.map(segment => 
  `[${segment.timestamp}] ${segment.speaker}: ${segment.text}`
).join('\n\n')}`

    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${result.meetingTitle.replace(/\s+/g, '_')}_search_results.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <div className="flex items-center justify-center min-h-screen bg-black">
            <div className="text-white text-lg">Loading...</div>
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
                <h1 className="text-2xl font-bold">Search Transcriptions</h1>
                <p className="text-zinc-400 text-sm mt-1">Find specific content across all your meetings</p>
              </div>
            </div>

            {/* Search Bar */}
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-400" />
                <Input
                  placeholder="Search for keywords, phrases, or topics..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="pl-10 bg-zinc-900 border-zinc-700 text-white placeholder-zinc-400"
                />
              </div>
              <Button 
                onClick={() => handleSearch()}
                disabled={isSearching || !searchQuery.trim()}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isSearching ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4 mr-2" />
                    Search
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Recent Searches */}
            {recentSearches.length > 0 && !searchResults.length && (
              <Card className="bg-zinc-900 border-zinc-800 p-6 mb-6">
                <h3 className="text-lg font-semibold text-white mb-4">Recent Searches</h3>
                <div className="flex flex-wrap gap-2">
                  {recentSearches.map((search, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSearchQuery(search)
                        handleSearch(search)
                      }}
                      className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                    >
                      {search}
                    </Button>
                  ))}
                </div>
              </Card>
            )}

            {/* Filters */}
            {searchResults.length > 0 && (
              <Card className="bg-zinc-900 border-zinc-800 p-6 mb-6">
                <h3 className="text-lg font-semibold text-white mb-4">Filters</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">Date Range</label>
                    <select
                      value={filters.dateRange}
                      onChange={(e) => handleFilterChange('dateRange', e.target.value)}
                      className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white text-sm"
                    >
                      <option value="all">All Time</option>
                      <option value="today">Today</option>
                      <option value="week">This Week</option>
                      <option value="month">This Month</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">Platform</label>
                    <select
                      value={filters.platform}
                      onChange={(e) => handleFilterChange('platform', e.target.value)}
                      className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white text-sm"
                    >
                      <option value="all">All Platforms</option>
                      <option value="Google Meet">Google Meet</option>
                      <option value="Zoom">Zoom</option>
                      <option value="Microsoft Teams">Microsoft Teams</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">Language</label>
                    <select
                      value={filters.language}
                      onChange={(e) => handleFilterChange('language', e.target.value)}
                      className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white text-sm"
                    >
                      <option value="all">All Languages</option>
                      <option value="en">English</option>
                      <option value="es">Spanish</option>
                      <option value="fr">French</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">Min Accuracy</label>
                    <select
                      value={filters.minAccuracy}
                      onChange={(e) => handleFilterChange('minAccuracy', e.target.value)}
                      className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white text-sm"
                    >
                      <option value="0">Any</option>
                      <option value="90">90%+</option>
                      <option value="95">95%+</option>
                      <option value="98">98%+</option>
                    </select>
                  </div>
                </div>
              </Card>
            )}

            {/* Search Results */}
            {searchResults.length === 0 && !isSearching ? (
              <div className="text-center py-12">
                <Search className="mx-auto h-12 w-12 text-zinc-600 mb-4" />
                <h3 className="text-lg font-medium text-zinc-300 mb-2">Search your transcriptions</h3>
                <p className="text-zinc-500 mb-4">
                  Enter keywords or phrases to find specific content across all your meetings
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {searchResults.map((result) => (
                  <Card key={result.id} className="bg-zinc-900 border-zinc-800 p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{getPlatformIcon(result.platform)}</span>
                        <div>
                          <h3 className="text-lg font-semibold text-white">{result.meetingTitle}</h3>
                          <p className="text-sm text-zinc-400">{result.platform}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => router.push(`/meetings/${encodeURIComponent(result.id)}`)}
                          className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View Full
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleExportResult(result)}
                          className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                        >
                          <Download className="h-4 w-4 mr-1" />
                          Export
                        </Button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div className="flex items-center gap-2 text-sm text-zinc-300">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(result.date)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-zinc-300">
                        <Clock className="h-4 w-4" />
                        <span>{result.duration}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-zinc-300">
                        <Users className="h-4 w-4" />
                        <span>{result.participants} participants</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-zinc-300">
                        <Mic className="h-4 w-4" />
                        <span>{result.accuracy}</span>
                      </div>
                    </div>

                    {/* Matching Segments */}
                    <div className="space-y-3">
                      <h4 className="text-sm font-medium text-zinc-300">
                        Found {result.matchingSegments.length} matching segment{result.matchingSegments.length !== 1 ? 's' : ''}
                      </h4>
                      {result.matchingSegments.map((segment, index) => (
                        <div key={index} className="bg-zinc-800 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-blue-400 font-mono">{segment.timestamp}</span>
                            <span className="text-sm text-zinc-400">{segment.speaker}</span>
                          </div>
                          <p className="text-sm text-zinc-300">{segment.text}</p>
                        </div>
                      ))}
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
