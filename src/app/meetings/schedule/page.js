'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { AppSidebar } from '@/components/app-sidebar'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Calendar, Clock, Users, Mic, Plus, ArrowLeft, Save } from 'lucide-react'

export default function ScheduleMeetingPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    platform: 'Google Meet',
    date: '',
    time: '',
    duration: '60',
    participants: '',
    language: 'en',
    botName: 'RavenAI Bot',
    autoJoin: true,
    recording: true
  })

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth')
      return
    }
  }, [user, loading, router])

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Import the API service dynamically to avoid SSR issues
      const { startMeetingBot } = await import('@/lib/vexa-api-service')
      
      // Create meeting URL based on platform
      let meetingUrl = ''
      const meetingId = generateMeetingId()
      
      switch (formData.platform) {
        case 'Google Meet':
          meetingUrl = `https://meet.google.com/${meetingId}`
          break
        case 'Zoom':
          meetingUrl = `https://zoom.us/j/${meetingId}`
          break
        case 'Microsoft Teams':
          meetingUrl = `https://teams.microsoft.com/l/meetup-join/${meetingId}`
          break
        default:
          meetingUrl = `https://meet.google.com/${meetingId}`
      }

      // Map platform names to API format
      const platformMap = {
        'Google Meet': 'google_meet',
        'Zoom': 'zoom',
        'Microsoft Teams': 'microsoft_teams'
      }

      const meetingData = {
        meetingUrl,
        platform: platformMap[formData.platform] || 'google_meet',
        language: formData.language,
        botName: formData.botName,
        description: `${formData.title} - ${formData.description}`
      }

      // Start the meeting bot
      const result = await startMeetingBot(meetingData)
      
      console.log('Meeting scheduled successfully:', result)
      
      // Redirect to the specific meeting page after successful scheduling
      if (result.meetingId) {
        router.push(`/meetings/${encodeURIComponent(result.meetingId)}`)
      } else {
        router.push('/meetings')
      }
    } catch (error) {
      console.error('Error scheduling meeting:', error)
      alert(`Error scheduling meeting: ${error.message}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const generateMeetingId = () => {
    // Generate a random meeting ID
    const chars = 'abcdefghijklmnopqrstuvwxyz'
    const nums = '0123456789'
    
    if (formData.platform === 'Google Meet') {
      // Format: xxx-xxxx-xxx
      const part1 = Array.from({length: 3}, () => chars[Math.floor(Math.random() * chars.length)]).join('')
      const part2 = Array.from({length: 4}, () => chars[Math.floor(Math.random() * chars.length)]).join('')
      const part3 = Array.from({length: 3}, () => chars[Math.floor(Math.random() * chars.length)]).join('')
      return `${part1}-${part2}-${part3}`
    } else if (formData.platform === 'Zoom') {
      // Format: 11 digit number
      return Array.from({length: 11}, () => nums[Math.floor(Math.random() * nums.length)]).join('')
    } else {
      // Microsoft Teams format
      return Array.from({length: 19}, () => chars[Math.floor(Math.random() * chars.length)]).join('')
    }
  }

  const platforms = [
    { value: 'Google Meet', label: 'Google Meet', icon: '🎥' },
    { value: 'Zoom', label: 'Zoom', icon: '📹' },
    { value: 'Microsoft Teams', label: 'Microsoft Teams', icon: '👥' }
  ]

  const languages = [
    { value: 'en', label: 'English' },
    { value: 'es', label: 'Spanish' },
    { value: 'fr', label: 'French' },
    { value: 'de', label: 'German' },
    { value: 'it', label: 'Italian' },
    { value: 'pt', label: 'Portuguese' },
    { value: 'ru', label: 'Russian' },
    { value: 'ja', label: 'Japanese' },
    { value: 'ko', label: 'Korean' },
    { value: 'zh', label: 'Chinese' }
  ]

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
            <div className="flex items-center gap-4">
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
                <h1 className="text-2xl font-bold">Schedule Meeting</h1>
                <p className="text-zinc-400 text-sm mt-1">Create a new meeting with AI transcription</p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 max-w-4xl mx-auto">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <Card className="bg-zinc-900 border-zinc-800 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">
                      Meeting Title *
                    </label>
                    <Input
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      placeholder="Enter meeting title"
                      required
                      className="bg-zinc-800 border-zinc-700 text-white placeholder-zinc-400"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">
                      Platform *
                    </label>
                    <select
                      name="platform"
                      value={formData.platform}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white text-sm"
                    >
                      {platforms.map(platform => (
                        <option key={platform.value} value={platform.value}>
                          {platform.icon} {platform.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Brief description of the meeting"
                    rows={3}
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white placeholder-zinc-400 text-sm"
                  />
                </div>
              </Card>

              {/* Date & Time */}
              <Card className="bg-zinc-900 border-zinc-800 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Date & Time</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">
                      Date *
                    </label>
                    <Input
                      name="date"
                      type="date"
                      value={formData.date}
                      onChange={handleInputChange}
                      required
                      className="bg-zinc-800 border-zinc-700 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">
                      Time *
                    </label>
                    <Input
                      name="time"
                      type="time"
                      value={formData.time}
                      onChange={handleInputChange}
                      required
                      className="bg-zinc-800 border-zinc-700 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">
                      Duration (minutes)
                    </label>
                    <select
                      name="duration"
                      value={formData.duration}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white text-sm"
                    >
                      <option value="30">30 minutes</option>
                      <option value="60">1 hour</option>
                      <option value="90">1.5 hours</option>
                      <option value="120">2 hours</option>
                      <option value="180">3 hours</option>
                    </select>
                  </div>
                </div>
              </Card>

              {/* Participants */}
              <Card className="bg-zinc-900 border-zinc-800 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Participants</h3>
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Expected Participants
                  </label>
                  <Input
                    name="participants"
                    value={formData.participants}
                    onChange={handleInputChange}
                    placeholder="Enter number of expected participants"
                    type="number"
                    min="1"
                    className="bg-zinc-800 border-zinc-700 text-white placeholder-zinc-400"
                  />
                </div>
              </Card>

              {/* AI Bot Configuration */}
              <Card className="bg-zinc-900 border-zinc-800 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">AI Bot Configuration</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">
                      Bot Name
                    </label>
                    <Input
                      name="botName"
                      value={formData.botName}
                      onChange={handleInputChange}
                      placeholder="Enter bot name"
                      className="bg-zinc-800 border-zinc-700 text-white placeholder-zinc-400"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">
                      Transcription Language
                    </label>
                    <select
                      name="language"
                      value={formData.language}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white text-sm"
                    >
                      {languages.map(lang => (
                        <option key={lang.value} value={lang.value}>
                          {lang.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="mt-4 space-y-3">
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      name="autoJoin"
                      checked={formData.autoJoin}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-blue-600 bg-zinc-800 border-zinc-700 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-zinc-300">Auto-join meeting when it starts</span>
                  </label>
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      name="recording"
                      checked={formData.recording}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-blue-600 bg-zinc-800 border-zinc-700 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-zinc-300">Enable meeting recording</span>
                  </label>
                </div>
              </Card>

              {/* Submit Button */}
              <div className="flex justify-end gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Scheduling...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Schedule Meeting
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
