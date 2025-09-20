'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { AppSidebar } from '@/components/app-sidebar'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { MeetingAnalyticsCards } from '@/components/meeting-analytics-cards'
import { MeetingChartInteractive } from '@/components/meeting-chart-interactive'
import { MeetingDataTable } from '@/components/meeting-data-table'
import { SiteHeader } from '@/components/site-header'

export default function AnalyticsPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [analytics, setAnalytics] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [meetingData, setMeetingData] = useState([])

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth')
      return
    }
    
    if (user) {
      fetchAnalytics()
    }
  }, [user, loading, router])

  const fetchAnalytics = async () => {
    try {
      setIsLoading(true)
      
      // Import the API service dynamically to avoid SSR issues
      const { getMeetingHistory, getMeetingTranscript } = await import('@/lib/vexa-api-service')
      
      // Get meeting history from Vexa API
      const meetings = await getMeetingHistory()
      
      if (meetings.length === 0) {
        setAnalytics({
          totalMeetings: 0,
          totalDuration: '0h 0m',
          totalParticipants: 0,
          averageDuration: '0m',
          transcriptionAccuracy: '0%',
          weeklyStats: [],
          platformStats: [],
          topKeywords: [],
          chartData: []
        })
        setMeetingData([])
        return
      }
      
      // Calculate total duration and other metrics
      let totalMinutes = 0
      let totalParticipants = 0
      const platformCounts = {}
      const weeklyData = {}
      const keywords = {}
      const monthlyData = {}
      
      // Initialize weekly data
      const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
      daysOfWeek.forEach(day => {
        weeklyData[day] = { meetings: 0, minutes: 0 }
      })
      
      // Process each meeting for analytics
      for (const meeting of meetings) {
        // Count meetings by platform
        const platformName = formatPlatformName(meeting.platform)
        platformCounts[platformName] = (platformCounts[platformName] || 0) + 1
        
        // Calculate duration
        if (meeting.startTime && meeting.endTime) {
          const duration = new Date(meeting.endTime) - new Date(meeting.startTime)
          const minutes = Math.floor(duration / (1000 * 60))
          totalMinutes += minutes
          
          // Weekly stats
          const dayOfWeek = daysOfWeek[new Date(meeting.startTime).getDay()]
          weeklyData[dayOfWeek].meetings += 1
          weeklyData[dayOfWeek].minutes += minutes
          
          // Monthly stats for chart
          const monthKey = new Date(meeting.startTime).toISOString().slice(0, 7) // YYYY-MM
          if (!monthlyData[monthKey]) {
            monthlyData[monthKey] = { meetings: 0, participants: 0 }
          }
          monthlyData[monthKey].meetings += 1
          monthlyData[monthKey].participants += meeting.participants.length || 0
        }
        
        // Count participants
        totalParticipants += meeting.participants.length || 0
        
        // Extract keywords from meeting titles and notes
        const text = `${meeting.title} ${meeting.notes}`.toLowerCase()
        const words = text.split(/\s+/).filter(word => word.length > 3)
        words.forEach(word => {
          const cleaned = word.replace(/[^\w]/g, '')
          if (cleaned) {
            keywords[cleaned] = (keywords[cleaned] || 0) + 1
          }
        })
      }
      
      // Format chart data for the last 6 months
      const chartData = []
      const now = new Date()
      for (let i = 5; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
        const monthKey = date.toISOString().slice(0, 7)
        const monthName = date.toLocaleDateString('en-US', { month: 'long' })
        
        chartData.push({
          date: monthKey,
          month: monthName,
          meetings: monthlyData[monthKey]?.meetings || 0,
          participants: monthlyData[monthKey]?.participants || 0
        })
      }
      
      // Calculate percentages for platforms
      const totalMeetings = meetings.length
      const platformStats = Object.entries(platformCounts).map(([platform, count]) => ({
        platform,
        count,
        percentage: Math.round((count / totalMeetings) * 100)
      }))
      
      // Get top keywords
      const topKeywords = Object.entries(keywords)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([keyword, count]) => ({ keyword, count }))
      
      // Format weekly stats
      const weeklyStats = daysOfWeek.map(day => ({
        day,
        meetings: weeklyData[day].meetings,
        duration: formatDuration(weeklyData[day].minutes)
      }))
      
      // Calculate averages
      const averageMinutes = totalMeetings > 0 ? Math.floor(totalMinutes / totalMeetings) : 0
      
      // Simulate transcription accuracy (would come from actual API)
      const transcriptionAccuracy = totalMeetings > 0 ? '98.7%' : '0%'
      
      const analyticsData = {
        totalMeetings,
        totalDuration: formatDuration(totalMinutes),
        totalParticipants,
        averageDuration: formatDuration(averageMinutes),
        transcriptionAccuracy,
        weeklyStats,
        platformStats,
        topKeywords,
        chartData
      }
      
      // Transform meetings data for table
      const transformedMeetingData = meetings.slice(0, 20).map((meeting, index) => ({
        id: index + 1,
        title: meeting.title,
        platform: formatPlatformName(meeting.platform),
        status: meeting.status === 'completed' ? 'Done' : 'In Process',
        duration: formatDuration(calculateMeetingDuration(meeting.startTime, meeting.endTime)),
        participants: meeting.participants.length.toString(),
        transcriptLength: Math.floor(Math.random() * 5000) + 1000, // Simulated
        date: new Date(meeting.startTime).toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric' 
        })
      }))
      
      setAnalytics(analyticsData)
      setMeetingData(transformedMeetingData)
    } catch (error) {
      console.error('Error fetching analytics:', error)
      // Set default empty analytics on error
      setAnalytics({
        totalMeetings: 0,
        totalDuration: '0h 0m',
        totalParticipants: 0,
        averageDuration: '0m',
        transcriptionAccuracy: '0%',
        weeklyStats: [],
        platformStats: [],
        topKeywords: [],
        chartData: []
      })
      setMeetingData([])
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

  const formatDuration = (minutes) => {
    if (minutes === 0) return '0m'
    
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    
    if (hours > 0) {
      return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`
    }
    
    return `${remainingMinutes}m`
  }

  const calculateMeetingDuration = (startTime, endTime) => {
    if (!endTime) return 0
    
    const start = new Date(startTime)
    const end = new Date(endTime)
    const durationMs = end - start
    return Math.floor(durationMs / (1000 * 60))
  }

  if (loading || isLoading) {
    return (
      <SidebarProvider>
        <AppSidebar variant="inset" />
        <SidebarInset>
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-lg">Loading analytics...</div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    )
  }

  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader title="Meeting Analytics" description="Insights and statistics from your meeting data" />
        <div className="flex flex-1 flex-col">
          <div className="flex flex-1 flex-col gap-6 p-6">
            <MeetingAnalyticsCards analytics={analytics} />
            <MeetingChartInteractive chartData={analytics.chartData} />
            <MeetingDataTable data={meetingData} onRefresh={fetchAnalytics} />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
