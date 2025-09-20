'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { AppSidebar } from '@/components/app-sidebar'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { Button } from '@/components/ui/button'
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Settings, TrendingUpIcon, CheckCircle, XCircle } from 'lucide-react'
import JiraConfigForm from '@/components/jira/JiraConfigForm'

export default function IntegrationsSettingsPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [integrations, setIntegrations] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [jiraConfigured, setJiraConfigured] = useState(false)
  const [showJiraConfig, setShowJiraConfig] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth')
      return
    }
    
    if (user) {
      fetchIntegrations()
    }
  }, [user, loading, router])

  const fetchIntegrations = async () => {
    try {
      setIsLoading(true)
      // Check if JIRA is already configured
      // This would normally be an API call to check user's JIRA credentials
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Only JIRA integration
      const jiraIntegration = {
        id: 'jira',
        name: 'JIRA',
        description: 'Automatically create tasks from meeting transcripts using AI',
        icon: '🔧',
        status: jiraConfigured ? 'connected' : 'available',
        features: ['AI task generation', 'Automatic task creation', 'Meeting integration'],
        lastSync: jiraConfigured ? new Date(Date.now() - 10 * 60 * 1000) : null,
        tasksCreated: jiraConfigured ? 42 : 0,
        accuracy: jiraConfigured ? '95%' : '0%'
      }
      
      setIntegrations([jiraIntegration])
    } catch (error) {
      console.error('Error fetching integrations:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleConnect = async (integrationId) => {
    try {
      if (integrationId === 'jira') {
        setShowJiraConfig(true)
        return
      }
      
      // Simulate connection process for other integrations
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      setIntegrations(prev => prev.map(integration => 
        integration.id === integrationId 
          ? { ...integration, status: 'connected', lastSync: new Date() }
          : integration
      ))
    } catch (error) {
      console.error('Error connecting integration:', error)
    }
  }

  const handleDisconnect = async (integrationId) => {
    if (confirm('Are you sure you want to disconnect this integration?')) {
      try {
        if (integrationId === 'jira') {
          setJiraConfigured(false)
          setIntegrations(prev => prev.map(integration => 
            integration.id === integrationId 
              ? { ...integration, status: 'available', lastSync: null }
              : integration
          ))
          return
        }
        
        // Simulate disconnection process for other integrations
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        setIntegrations(prev => prev.map(integration => 
          integration.id === integrationId 
            ? { ...integration, status: 'available', lastSync: null }
            : integration
        ))
      } catch (error) {
        console.error('Error disconnecting integration:', error)
      }
    }
  }

  const handleJiraConfigured = (config) => {
    setJiraConfigured(!!config)
    setShowJiraConfig(false)
    setIntegrations(prev => prev.map(integration => 
      integration.id === 'jira' 
        ? { ...integration, status: config ? 'connected' : 'available', lastSync: config ? new Date() : null }
        : integration
    ))
  }

  const handleJiraError = (error) => {
    console.error('JIRA configuration error:', error)
    // You could show a toast notification here
  }

  const formatLastSync = (date) => {
    if (!date) return 'Never'
    const now = new Date()
    const diffInMinutes = Math.floor((now - date) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hours ago`
    return `${Math.floor(diffInMinutes / 1440)} days ago`
  }

  if (loading || isLoading) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <div className="flex items-center justify-center min-h-screen bg-black">
            <div className="text-white text-lg">Loading integrations...</div>
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
                <h1 className="text-2xl font-bold">Integrations</h1>
                <p className="text-zinc-400 text-sm mt-1">Connect RavenAI with your favorite tools and services</p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* JIRA Integration Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* Connection Status */}
              <Card>
                <CardHeader className="relative">
                  <CardDescription>JIRA Integration</CardDescription>
                  <CardTitle className="text-2xl font-semibold tabular-nums">
                    {integrations[0]?.status === 'connected' ? 'Connected' : 'Available'}
                  </CardTitle>
                  <div className="absolute right-4 top-4">
                    <Badge variant="outline" className="flex gap-1 rounded-lg text-xs">
                      {integrations[0]?.status === 'connected' ? (
                        <CheckCircle className="size-3 text-green-400" />
                      ) : (
                        <XCircle className="size-3 text-gray-400" />
                      )}
                      {integrations[0]?.status === 'connected' ? 'Active' : 'Setup Required'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardFooter className="flex-col items-start gap-1 text-sm">
                  <div className="flex gap-2 font-medium">
                    {integrations[0]?.status === 'connected' ? (
                      <>
                        Ready to create tasks <TrendingUpIcon className="size-4" />
                      </>
                    ) : (
                      <>
                        Configure JIRA credentials <Settings className="size-4" />
                      </>
                    )}
                  </div>
                  <div className="text-muted-foreground">
                    AI-powered task generation
                  </div>
                </CardFooter>
              </Card>

              {/* Tasks Created */}
              <Card>
                <CardHeader className="relative">
                  <CardDescription>Tasks Created</CardDescription>
                  <CardTitle className="text-2xl font-semibold tabular-nums">
                    {integrations[0]?.tasksCreated || 0}
                  </CardTitle>
                  <div className="absolute right-4 top-4">
                    <Badge variant="outline" className="flex gap-1 rounded-lg text-xs">
                      🔧 
                      +12.5%
                    </Badge>
                  </div>
                </CardHeader>
                <CardFooter className="flex-col items-start gap-1 text-sm">
                  <div className="flex gap-2 font-medium">
                    {integrations[0]?.tasksCreated > 0 ? (
                      <>
                        Productive automation <TrendingUpIcon className="size-4" />
                      </>
                    ) : (
                      <>
                        Start creating tasks <Settings className="size-4" />
                      </>
                    )}
                  </div>
                  <div className="text-muted-foreground">
                    Tasks generated from meetings
                  </div>
                </CardFooter>
              </Card>

              {/* AI Accuracy */}
              <Card>
                <CardHeader className="relative">
                  <CardDescription>AI Accuracy</CardDescription>
                  <CardTitle className="text-2xl font-semibold tabular-nums">
                    {integrations[0]?.accuracy || '0%'}
                  </CardTitle>
                  <div className="absolute right-4 top-4">
                    <Badge variant="outline" className="flex gap-1 rounded-lg text-xs">
                      🤖
                      High Quality
                    </Badge>
                  </div>
                </CardHeader>
                <CardFooter className="flex-col items-start gap-1 text-sm">
                  <div className="flex gap-2 font-medium">
                    {parseFloat(integrations[0]?.accuracy || '0') > 90 ? (
                      <>
                        Excellent performance <TrendingUpIcon className="size-4" />
                      </>
                    ) : integrations[0]?.accuracy !== '0%' ? (
                      <>
                        Good performance <TrendingUpIcon className="size-4" />
                      </>
                    ) : (
                      <>
                        No data yet <Settings className="size-4" />
                      </>
                    )}
                  </div>
                  <div className="text-muted-foreground">
                    Task generation accuracy
                  </div>
                </CardFooter>
              </Card>

              {/* Last Sync */}
              <Card>
                <CardHeader className="relative">
                  <CardDescription>Last Sync</CardDescription>
                  <CardTitle className="text-2xl font-semibold tabular-nums">
                    {formatLastSync(integrations[0]?.lastSync)}
                  </CardTitle>
                  <div className="absolute right-4 top-4">
                    <Badge variant="outline" className="flex gap-1 rounded-lg text-xs">
                      ⏱️
                      Real-time
                    </Badge>
                  </div>
                </CardHeader>
                <CardFooter className="flex-col items-start gap-1 text-sm">
                  <div className="flex gap-2 font-medium">
                    {integrations[0]?.lastSync ? (
                      <>
                        Recently active <TrendingUpIcon className="size-4" />
                      </>
                    ) : (
                      <>
                        Not synced yet <Settings className="size-4" />
                      </>
                    )}
                  </div>
                  <div className="text-muted-foreground">
                    Integration activity status
                  </div>
                </CardFooter>
              </Card>
            </div>

            {/* JIRA Configuration Section */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-white">JIRA Configuration</h2>
                  <p className="text-sm text-zinc-400 mt-1">
                    Configure your JIRA workspace to enable automatic task creation from meeting transcripts
                  </p>
                </div>
                <div className="flex gap-3">
                  {integrations[0]?.status === 'connected' ? (
                    <>
                      <Button
                        variant="outline"
                        onClick={() => setShowJiraConfig(true)}
                        className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                      >
                        <Settings className="h-4 w-4 mr-2" />
                        Configure
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleDisconnect('jira')}
                        className="border-red-700 text-red-300 hover:bg-red-900/20"
                      >
                        Disconnect
                      </Button>
                    </>
                  ) : (
                    <Button
                      onClick={() => handleConnect('jira')}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      Connect JIRA
                    </Button>
                  )}
                </div>
              </div>

              {/* Features Overview */}
              <Card className="bg-zinc-900 border-zinc-800 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Integration Features</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-400" />
                      <span className="font-medium text-white">AI Task Generation</span>
                    </div>
                    <p className="text-sm text-zinc-400">
                      Automatically extract actionable tasks from meeting transcripts using advanced AI
                    </p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-400" />
                      <span className="font-medium text-white">Smart Validation</span>
                    </div>
                    <p className="text-sm text-zinc-400">
                      Review and edit generated tasks before they're created in your JIRA workspace
                    </p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-400" />
                      <span className="font-medium text-white">Seamless Integration</span>
                    </div>
                    <p className="text-sm text-zinc-400">
                      Direct integration with your JIRA projects, respecting your existing workflows
                    </p>
                  </div>
                </div>
              </Card>
            </div>

            {/* JIRA Configuration Modal */}
            {showJiraConfig && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-zinc-900 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-xl font-semibold text-white">Configure JIRA Integration</h2>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowJiraConfig(false)}
                        className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                      >
                        Cancel
                      </Button>
                    </div>
                    <JiraConfigForm
                      onConfigured={handleJiraConfigured}
                      onError={handleJiraError}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
