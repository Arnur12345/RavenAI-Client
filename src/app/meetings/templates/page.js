'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { AppSidebar } from '@/components/app-sidebar'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { FileText, Plus, Copy, Edit, Trash2, Calendar, Clock, Users, Mic } from 'lucide-react'

export default function MeetingTemplatesPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [templates, setTemplates] = useState([])
  const [filteredTemplates, setFilteredTemplates] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    description: '',
    platform: 'Google Meet',
    duration: '60',
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
    
    if (user) {
      fetchTemplates()
    }
  }, [user, loading, router])

  useEffect(() => {
    filterTemplates()
  }, [templates, searchTerm])

  const fetchTemplates = async () => {
    try {
      setIsLoading(true)
      // Simulate API call - replace with actual API integration
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Mock data for meeting templates
      const mockTemplates = [
        {
          id: '1',
          name: 'Daily Standup',
          description: 'Quick daily team sync meeting',
          platform: 'Google Meet',
          duration: '30',
          language: 'en',
          botName: 'RavenAI Bot',
          autoJoin: true,
          recording: false,
          createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          usageCount: 15
        },
        {
          id: '2',
          name: 'Client Presentation',
          description: 'Formal client presentation and review',
          platform: 'Zoom',
          duration: '90',
          language: 'en',
          botName: 'RavenAI Bot',
          autoJoin: true,
          recording: true,
          createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
          usageCount: 8
        },
        {
          id: '3',
          name: 'Sprint Planning',
          description: 'Agile sprint planning session',
          platform: 'Microsoft Teams',
          duration: '120',
          language: 'en',
          botName: 'RavenAI Bot',
          autoJoin: true,
          recording: true,
          createdAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000),
          usageCount: 12
        },
        {
          id: '4',
          name: 'One-on-One',
          description: 'Personal one-on-one meeting',
          platform: 'Google Meet',
          duration: '60',
          language: 'en',
          botName: 'RavenAI Bot',
          autoJoin: false,
          recording: false,
          createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          usageCount: 25
        }
      ]
      
      setTemplates(mockTemplates)
    } catch (error) {
      console.error('Error fetching templates:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const filterTemplates = () => {
    let filtered = templates

    if (searchTerm) {
      filtered = filtered.filter(template =>
        template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    setFilteredTemplates(filtered)
  }

  const handleCreateTemplate = async (e) => {
    e.preventDefault()
    try {
      // Simulate API call - replace with actual API integration
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const template = {
        id: Date.now().toString(),
        ...newTemplate,
        createdAt: new Date(),
        usageCount: 0
      }
      
      setTemplates(prev => [template, ...prev])
      setNewTemplate({
        name: '',
        description: '',
        platform: 'Google Meet',
        duration: '60',
        language: 'en',
        botName: 'RavenAI Bot',
        autoJoin: true,
        recording: true
      })
      setShowCreateForm(false)
    } catch (error) {
      console.error('Error creating template:', error)
    }
  }

  const handleUseTemplate = (template) => {
    // Navigate to schedule page with template data
    const params = new URLSearchParams({
      template: JSON.stringify(template)
    })
    router.push(`/meetings/schedule?${params.toString()}`)
  }

  const handleDeleteTemplate = async (templateId) => {
    if (confirm('Are you sure you want to delete this template?')) {
      try {
        // Simulate API call - replace with actual API integration
        await new Promise(resolve => setTimeout(resolve, 500))
        
        setTemplates(prev => prev.filter(template => template.id !== templateId))
      } catch (error) {
        console.error('Error deleting template:', error)
      }
    }
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

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (loading || isLoading) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <div className="flex items-center justify-center min-h-screen bg-black">
            <div className="text-white text-lg">Loading templates...</div>
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
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold">Meeting Templates</h1>
                <p className="text-zinc-400 text-sm mt-1">Create and manage meeting templates</p>
              </div>
              <Button 
                onClick={() => setShowCreateForm(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Template
              </Button>
            </div>

            {/* Search */}
            <div className="relative max-w-md">
              <Input
                placeholder="Search templates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-zinc-900 border-zinc-700 text-white placeholder-zinc-400"
              />
              <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-400" />
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Create Template Form */}
            {showCreateForm && (
              <Card className="bg-zinc-900 border-zinc-800 p-6 mb-6">
                <h3 className="text-lg font-semibold text-white mb-4">Create New Template</h3>
                <form onSubmit={handleCreateTemplate} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-zinc-300 mb-2">
                        Template Name *
                      </label>
                      <Input
                        value={newTemplate.name}
                        onChange={(e) => setNewTemplate(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Enter template name"
                        required
                        className="bg-zinc-800 border-zinc-700 text-white placeholder-zinc-400"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-zinc-300 mb-2">
                        Platform
                      </label>
                      <select
                        value={newTemplate.platform}
                        onChange={(e) => setNewTemplate(prev => ({ ...prev, platform: e.target.value }))}
                        className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white text-sm"
                      >
                        <option value="Google Meet">🎥 Google Meet</option>
                        <option value="Zoom">📹 Zoom</option>
                        <option value="Microsoft Teams">👥 Microsoft Teams</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">
                      Description
                    </label>
                    <textarea
                      value={newTemplate.description}
                      onChange={(e) => setNewTemplate(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Brief description of this template"
                      rows={2}
                      className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white placeholder-zinc-400 text-sm"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowCreateForm(false)}
                      className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      Create Template
                    </Button>
                  </div>
                </form>
              </Card>
            )}

            {/* Templates Grid */}
            {filteredTemplates.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="mx-auto h-12 w-12 text-zinc-600 mb-4" />
                <h3 className="text-lg font-medium text-zinc-300 mb-2">
                  {searchTerm ? 'No templates found' : 'No templates yet'}
                </h3>
                <p className="text-zinc-500 mb-4">
                  {searchTerm 
                    ? 'Try adjusting your search' 
                    : 'Create your first template to get started'
                  }
                </p>
                {!searchTerm && (
                  <Button 
                    onClick={() => setShowCreateForm(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Template
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTemplates.map((template) => (
                  <Card key={template.id} className="bg-zinc-900 border-zinc-800 p-6 hover:bg-zinc-800 transition-colors">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{getPlatformIcon(template.platform)}</span>
                        <div>
                          <h3 className="text-lg font-semibold text-white">{template.name}</h3>
                          <p className="text-sm text-zinc-400">{template.description}</p>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteTemplate(template.id)}
                          className="border-red-700 text-red-300 hover:bg-red-900/20 p-1"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm text-zinc-300">
                        <Clock className="h-4 w-4" />
                        <span>{template.duration} minutes</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-zinc-300">
                        <Mic className="h-4 w-4" />
                        <span>{template.language.toUpperCase()}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-zinc-300">
                        <Calendar className="h-4 w-4" />
                        <span>Created {formatDate(template.createdAt)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-zinc-300">
                        <Users className="h-4 w-4" />
                        <span>Used {template.usageCount} times</span>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button 
                        onClick={() => handleUseTemplate(template)}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Use Template
                      </Button>
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
