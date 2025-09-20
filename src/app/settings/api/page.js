'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { AppSidebar } from '@/components/app-sidebar'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Key, Save, ArrowLeft, Copy, Eye, EyeOff, RefreshCw, TestTube, CheckCircle, XCircle } from 'lucide-react'

export default function ApiSettingsPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)
  const [isTesting, setIsTesting] = useState(false)
  const [showApiKey, setShowApiKey] = useState(false)
  const [apiSettings, setApiSettings] = useState({
    apiKey: '',
    baseUrl: 'https://api.cloud.vexa.ai',
    webSocketUrl: 'wss://api.cloud.vexa.ai/ws',
    timeout: '30',
    retryAttempts: '3',
    rateLimit: '100',
    webhookUrl: '',
    webhookSecret: ''
  })
  const [testResults, setTestResults] = useState(null)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth')
      return
    }
    
    if (user) {
      loadApiSettings()
    }
  }, [user, loading, router])

  const loadApiSettings = () => {
    // Load from localStorage or API
    const savedSettings = localStorage.getItem('ravenai_api_settings')
    if (savedSettings) {
      setApiSettings(JSON.parse(savedSettings))
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setApiSettings(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      // Save to localStorage and API
      localStorage.setItem('ravenai_api_settings', JSON.stringify(apiSettings))
      
      // Simulate API call - replace with actual API integration
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      console.log('Saving API settings:', apiSettings)
      
    } catch (error) {
      console.error('Error saving API settings:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleTestConnection = async () => {
    setIsTesting(true)
    setTestResults(null)

    try {
      // Simulate API test - replace with actual API test
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Mock test results
      const mockResults = {
        success: true,
        latency: Math.floor(Math.random() * 200) + 50,
        tests: [
          { name: 'Authentication', status: 'success', message: 'API key is valid' },
          { name: 'Base URL', status: 'success', message: 'Endpoint is reachable' },
          { name: 'WebSocket', status: 'success', message: 'WebSocket connection established' },
          { name: 'Rate Limit', status: 'success', message: 'Rate limit headers received' }
        ]
      }
      
      setTestResults(mockResults)
    } catch (error) {
      setTestResults({
        success: false,
        error: 'Connection test failed',
        tests: [
          { name: 'Authentication', status: 'error', message: 'Invalid API key' },
          { name: 'Base URL', status: 'error', message: 'Endpoint unreachable' },
          { name: 'WebSocket', status: 'error', message: 'Connection failed' },
          { name: 'Rate Limit', status: 'error', message: 'No response' }
        ]
      })
    } finally {
      setIsTesting(false)
    }
  }

  const handleGenerateApiKey = () => {
    // Generate a mock API key
    const newApiKey = 'raven_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now().toString(36)
    setApiSettings(prev => ({
      ...prev,
      apiKey: newApiKey
    }))
  }

  const handleCopyApiKey = () => {
    navigator.clipboard.writeText(apiSettings.apiKey)
    // You could add a toast notification here
  }

  const handleResetSettings = () => {
    if (confirm('Are you sure you want to reset all API settings to default?')) {
      setApiSettings({
        apiKey: '',
        baseUrl: 'https://api.cloud.vexa.ai',
        webSocketUrl: 'wss://api.cloud.vexa.ai/ws',
        timeout: '30',
        retryAttempts: '3',
        rateLimit: '100',
        webhookUrl: '',
        webhookSecret: ''
      })
      setTestResults(null)
    }
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
                <h1 className="text-2xl font-bold">API Keys</h1>
                <p className="text-zinc-400 text-sm mt-1">Configure your API access and webhook settings</p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 max-w-4xl mx-auto">
            <form onSubmit={handleSave} className="space-y-6">
              {/* API Configuration */}
              <Card className="bg-zinc-900 border-zinc-800 p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Key className="h-5 w-5" />
                  API Configuration
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">
                      API Key *
                    </label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Input
                          name="apiKey"
                          type={showApiKey ? 'text' : 'password'}
                          value={apiSettings.apiKey}
                          onChange={handleInputChange}
                          placeholder="Enter your API key"
                          required
                          className="bg-zinc-800 border-zinc-700 text-white placeholder-zinc-400 pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowApiKey(!showApiKey)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-zinc-400 hover:text-zinc-300"
                        >
                          {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      <Button
                        type="button"
                        onClick={handleGenerateApiKey}
                        variant="outline"
                        className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                      >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Generate
                      </Button>
                      <Button
                        type="button"
                        onClick={handleCopyApiKey}
                        variant="outline"
                        className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-zinc-300 mb-2">
                        Base URL
                      </label>
                      <Input
                        name="baseUrl"
                        value={apiSettings.baseUrl}
                        onChange={handleInputChange}
                        placeholder="https://api.cloud.vexa.ai"
                        className="bg-zinc-800 border-zinc-700 text-white placeholder-zinc-400"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-zinc-300 mb-2">
                        WebSocket URL
                      </label>
                      <Input
                        name="webSocketUrl"
                        value={apiSettings.webSocketUrl}
                        onChange={handleInputChange}
                        placeholder="wss://api.cloud.vexa.ai/ws"
                        className="bg-zinc-800 border-zinc-700 text-white placeholder-zinc-400"
                      />
                    </div>
                  </div>
                </div>
              </Card>

              {/* Connection Settings */}
              <Card className="bg-zinc-900 border-zinc-800 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Connection Settings</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">
                      Timeout (seconds)
                    </label>
                    <Input
                      name="timeout"
                      type="number"
                      value={apiSettings.timeout}
                      onChange={handleInputChange}
                      min="5"
                      max="300"
                      className="bg-zinc-800 border-zinc-700 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">
                      Retry Attempts
                    </label>
                    <Input
                      name="retryAttempts"
                      type="number"
                      value={apiSettings.retryAttempts}
                      onChange={handleInputChange}
                      min="1"
                      max="10"
                      className="bg-zinc-800 border-zinc-700 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">
                      Rate Limit (requests/min)
                    </label>
                    <Input
                      name="rateLimit"
                      type="number"
                      value={apiSettings.rateLimit}
                      onChange={handleInputChange}
                      min="10"
                      max="1000"
                      className="bg-zinc-800 border-zinc-700 text-white"
                    />
                  </div>
                </div>
              </Card>

              {/* Webhook Settings */}
              <Card className="bg-zinc-900 border-zinc-800 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Webhook Settings</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">
                      Webhook URL
                    </label>
                    <Input
                      name="webhookUrl"
                      value={apiSettings.webhookUrl}
                      onChange={handleInputChange}
                      placeholder="https://your-domain.com/webhook"
                      className="bg-zinc-800 border-zinc-700 text-white placeholder-zinc-400"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">
                      Webhook Secret
                    </label>
                    <Input
                      name="webhookSecret"
                      type="password"
                      value={apiSettings.webhookSecret}
                      onChange={handleInputChange}
                      placeholder="Enter webhook secret"
                      className="bg-zinc-800 border-zinc-700 text-white placeholder-zinc-400"
                    />
                  </div>
                </div>
              </Card>

              {/* Test Connection */}
              <Card className="bg-zinc-900 border-zinc-800 p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <TestTube className="h-5 w-5" />
                  Test Connection
                </h3>
                <div className="flex gap-4 mb-4">
                  <Button
                    type="button"
                    onClick={handleTestConnection}
                    disabled={isTesting || !apiSettings.apiKey}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    {isTesting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Testing...
                      </>
                    ) : (
                      <>
                        <TestTube className="h-4 w-4 mr-2" />
                        Test Connection
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    onClick={handleResetSettings}
                    variant="outline"
                    className="border-red-700 text-red-300 hover:bg-red-900/20"
                  >
                    Reset to Default
                  </Button>
                </div>

                {/* Test Results */}
                {testResults && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      {testResults.success ? (
                        <CheckCircle className="h-5 w-5 text-green-400" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-400" />
                      )}
                      <span className="text-sm font-medium text-zinc-300">
                        {testResults.success ? 'Connection successful' : 'Connection failed'}
                      </span>
                      {testResults.latency && (
                        <span className="text-sm text-zinc-400">
                          ({testResults.latency}ms latency)
                        </span>
                      )}
                    </div>
                    <div className="space-y-2">
                      {testResults.tests.map((test, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                          {test.status === 'success' ? (
                            <CheckCircle className="h-4 w-4 text-green-400" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-400" />
                          )}
                          <span className="text-zinc-300">{test.name}:</span>
                          <span className="text-zinc-400">{test.message}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </Card>

              {/* Save Button */}
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
                  disabled={isSaving}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {isSaving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Settings
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
