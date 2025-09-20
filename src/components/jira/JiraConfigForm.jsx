'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { CheckCircle, XCircle, Loader2, ExternalLink, Eye, EyeOff } from 'lucide-react'
import { tokenManager } from '@/lib/custom-auth'

export default function JiraConfigForm({ onConfigured, onError }) {
  const [formData, setFormData] = useState({
    domain: '',
    apiToken: '',
    projectKey: '',
    email: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [isValidating, setIsValidating] = useState(false)
  const [showApiToken, setShowApiToken] = useState(false)
  const [validationResult, setValidationResult] = useState(null)
  const [existingConfig, setExistingConfig] = useState(null)

  useEffect(() => {
    loadExistingConfig()
  }, [])

  const loadExistingConfig = async () => {
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
        if (result.data) {
          setExistingConfig(result.data)
          setFormData(prev => ({
            ...prev,
            domain: result.data.domain || '',
            projectKey: result.data.project_key || '',
            // Don't populate API token for security
            apiToken: result.data.hasApiToken ? '••••••••••••••••' : ''
          }))
        }
      }
    } catch (error) {
      console.error('Error loading existing config:', error)
    }
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setValidationResult(null)
  }

  const validateConfig = async () => {
    if (!formData.domain || !formData.apiToken || !formData.projectKey) {
      setValidationResult({
        valid: false,
        error: 'All fields are required'
      })
      return false
    }

    setIsValidating(true)
    try {
      const token = tokenManager.getToken()
      const response = await fetch('/api/jira/credentials', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          domain: formData.domain,
          apiToken: formData.apiToken === '••••••••••••••••' ? undefined : formData.apiToken,
          projectKey: formData.projectKey,
          email: formData.email
        })
      })

      const result = await response.json()

      if (response.ok) {
        setValidationResult({
          valid: true,
          user: result.data.jiraUser,
          message: result.message
        })
        setExistingConfig(result.data)
        if (onConfigured) onConfigured(result.data)
        return true
      } else {
        setValidationResult({
          valid: false,
          error: result.error
        })
        if (onError) onError(result.error)
        return false
      }
    } catch (error) {
      const errorMsg = 'Failed to validate JIRA configuration'
      setValidationResult({
        valid: false,
        error: errorMsg
      })
      if (onError) onError(errorMsg)
      return false
    } finally {
      setIsValidating(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    
    const success = await validateConfig()
    if (success) {
      // Configuration saved successfully
    }
    
    setIsLoading(false)
  }

  const handleDisconnect = async () => {
    if (!confirm('Are you sure you want to disconnect JIRA integration?')) {
      return
    }

    setIsLoading(true)
    try {
      const token = tokenManager.getToken()
      const response = await fetch('/api/jira/credentials', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        setExistingConfig(null)
        setFormData({
          domain: '',
          apiToken: '',
          projectKey: '',
          email: ''
        })
        setValidationResult(null)
        if (onConfigured) onConfigured(null)
      } else {
        const result = await response.json()
        if (onError) onError(result.error)
      }
    } catch (error) {
      if (onError) onError('Failed to disconnect JIRA integration')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="bg-zinc-900 border-zinc-800 p-6">
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🔧</span>
          <div>
            <h3 className="text-lg font-semibold text-white">JIRA Integration</h3>
            <p className="text-sm text-zinc-400">
              Connect your JIRA workspace to automatically create tasks from meeting transcripts
            </p>
          </div>
        </div>
        {existingConfig && (
          <span className="px-2 py-1 rounded-full text-xs font-medium text-green-400 bg-green-400/10">
            Connected
          </span>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">
            JIRA Domain
          </label>
          <Input
            type="text"
            placeholder="your-company.atlassian.net"
            value={formData.domain}
            onChange={(e) => handleInputChange('domain', e.target.value)}
            className="bg-zinc-800 border-zinc-700 text-white"
            disabled={isLoading}
          />
          <p className="text-xs text-zinc-500 mt-1">
            Your JIRA workspace domain (without https://)
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">
            API Token
          </label>
          <div className="relative">
            <Input
              type={showApiToken ? "text" : "password"}
              placeholder="Your JIRA API token"
              value={formData.apiToken}
              onChange={(e) => handleInputChange('apiToken', e.target.value)}
              className="bg-zinc-800 border-zinc-700 text-white pr-10"
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowApiToken(!showApiToken)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-zinc-400 hover:text-zinc-300"
            >
              {showApiToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-xs text-zinc-500">
              Generate an API token in your JIRA account settings
            </p>
            <a
              href="https://id.atlassian.com/manage-profile/security/api-tokens"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
            >
              <ExternalLink className="h-3 w-3" />
              Get Token
            </a>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">
            Project Key
          </label>
          <Input
            type="text"
            placeholder="PROJ"
            value={formData.projectKey}
            onChange={(e) => handleInputChange('projectKey', e.target.value.toUpperCase())}
            className="bg-zinc-800 border-zinc-700 text-white"
            disabled={isLoading}
          />
          <p className="text-xs text-zinc-500 mt-1">
            The key of the JIRA project where tasks will be created
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">
            Email (Optional)
          </label>
          <Input
            type="email"
            placeholder="your-email@company.com"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            className="bg-zinc-800 border-zinc-700 text-white"
            disabled={isLoading}
          />
          <p className="text-xs text-zinc-500 mt-1">
            Email associated with your JIRA account (for authentication)
          </p>
        </div>

        {validationResult && (
          <div className={`p-3 rounded-lg border ${
            validationResult.valid 
              ? 'bg-green-900/20 border-green-900/30' 
              : 'bg-red-900/20 border-red-900/30'
          }`}>
            <div className="flex items-center gap-2">
              {validationResult.valid ? (
                <CheckCircle className="h-4 w-4 text-green-400" />
              ) : (
                <XCircle className="h-4 w-4 text-red-400" />
              )}
              <p className={`text-sm ${
                validationResult.valid ? 'text-green-400' : 'text-red-400'
              }`}>
                {validationResult.valid 
                  ? validationResult.message || 'JIRA configuration validated successfully'
                  : validationResult.error
                }
              </p>
            </div>
            {validationResult.valid && validationResult.user && (
              <p className="text-xs text-zinc-400 mt-1">
                Connected as: {validationResult.user.displayName || validationResult.user.emailAddress}
              </p>
            )}
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <Button
            type="submit"
            disabled={isLoading || isValidating}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isLoading || isValidating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {isValidating ? 'Validating...' : 'Saving...'}
              </>
            ) : (
              existingConfig ? 'Update Configuration' : 'Save Configuration'
            )}
          </Button>
          
          {existingConfig && (
            <Button
              type="button"
              variant="outline"
              onClick={handleDisconnect}
              disabled={isLoading}
              className="border-red-700 text-red-300 hover:bg-red-900/20"
            >
              Disconnect
            </Button>
          )}
        </div>
      </form>
    </Card>
  )
}
