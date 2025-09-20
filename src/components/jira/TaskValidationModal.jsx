'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { X, Plus, Trash2, Loader2, CheckCircle, AlertCircle, ExternalLink } from 'lucide-react'

export default function TaskValidationModal({ 
  isOpen, 
  onClose, 
  initialTasks = [], 
  onCreateTasks,
  meetingTitle = '',
  isLoading = false 
}) {
  const [tasks, setTasks] = useState([])
  const [isCreating, setIsCreating] = useState(false)
  const [creationResult, setCreationResult] = useState(null)

  useEffect(() => {
    if (isOpen && initialTasks.length > 0) {
      setTasks(initialTasks.map((task, index) => ({
        id: `task-${index}`,
        summary: task.summary || '',
        description: task.description || '',
        issue_type: task.issue_type || 'Task',
        priority: task.priority || 'Medium',
        labels: task.labels || []
      })))
      setCreationResult(null)
    }
  }, [isOpen, initialTasks])

  const handleTaskChange = (taskId, field, value) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, [field]: value } : task
    ))
  }

  const handleAddTask = () => {
    const newTask = {
      id: `task-${Date.now()}`,
      summary: '',
      description: '',
      issue_type: 'Task',
      priority: 'Medium',
      labels: []
    }
    setTasks(prev => [...prev, newTask])
  }

  const handleRemoveTask = (taskId) => {
    setTasks(prev => prev.filter(task => task.id !== taskId))
  }

  const handleCreateTasks = async () => {
    // Validate tasks
    const validTasks = tasks.filter(task => task.summary.trim() && task.description.trim())
    
    if (validTasks.length === 0) {
      alert('Please add at least one task with both summary and description.')
      return
    }

    setIsCreating(true)
    try {
      const result = await onCreateTasks(validTasks)
      setCreationResult(result)
    } catch (error) {
      setCreationResult({
        success: false,
        error: error.message || 'Failed to create tasks'
      })
    } finally {
      setIsCreating(false)
    }
  }

  const handleClose = () => {
    setTasks([])
    setCreationResult(null)
    onClose()
  }

  const priorityOptions = [
    { value: 'Highest', label: 'Highest', color: 'text-red-400' },
    { value: 'High', label: 'High', color: 'text-orange-400' },
    { value: 'Medium', label: 'Medium', color: 'text-yellow-400' },
    { value: 'Low', label: 'Low', color: 'text-green-400' },
    { value: 'Lowest', label: 'Lowest', color: 'text-blue-400' }
  ]

  const issueTypeOptions = [
    { value: 'Task', label: 'Task' },
    { value: 'Story', label: 'Story' },
    { value: 'Bug', label: 'Bug' },
    { value: 'Epic', label: 'Epic' }
  ]

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-zinc-800">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-white">Review JIRA Tasks</h2>
              <p className="text-sm text-zinc-400 mt-1">
                {meetingTitle ? `Generated from: ${meetingTitle}` : 'Review and edit tasks before creating them in JIRA'}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleClose}
              className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-400 mx-auto mb-4" />
                <p className="text-white">Generating tasks from meeting transcript...</p>
                <p className="text-sm text-zinc-400 mt-1">This may take a few moments</p>
              </div>
            </div>
          ) : creationResult ? (
            <div className="space-y-4">
              {creationResult.success ? (
                <div className="bg-green-900/20 border border-green-900/30 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="h-5 w-5 text-green-400" />
                    <h3 className="text-lg font-semibold text-green-400">Tasks Created Successfully!</h3>
                  </div>
                  <p className="text-green-300 mb-4">
                    {creationResult.data?.successCount || 0} out of {creationResult.data?.total || 0} tasks were created in JIRA.
                  </p>
                  
                  {creationResult.data?.successful?.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-medium text-green-300">Created Tasks:</h4>
                      {creationResult.data.successful.map((task, index) => (
                        <div key={index} className="bg-green-900/10 rounded p-3">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-green-200">{task.key}</span>
                            <a
                              href={task.self}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-green-400 hover:text-green-300 flex items-center gap-1"
                            >
                              <ExternalLink className="h-3 w-3" />
                              View
                            </a>
                          </div>
                          <p className="text-sm text-green-300 mt-1">{task.summary || 'Task created'}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {creationResult.data?.failed?.length > 0 && (
                    <div className="mt-4 space-y-2">
                      <h4 className="font-medium text-orange-300">Failed Tasks:</h4>
                      {creationResult.data.failed.map((error, index) => (
                        <div key={index} className="bg-orange-900/10 rounded p-3">
                          <p className="text-sm text-orange-300">{error}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-red-900/20 border border-red-900/30 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="h-5 w-5 text-red-400" />
                    <h3 className="text-lg font-semibold text-red-400">Task Creation Failed</h3>
                  </div>
                  <p className="text-red-300">{creationResult.error}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">
                  Tasks to Create ({tasks.length})
                </h3>
                <Button
                  onClick={handleAddTask}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Task
                </Button>
              </div>

              {tasks.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-zinc-400">No tasks generated. Click "Add Task" to create one manually.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {tasks.map((task, index) => (
                    <Card key={task.id} className="bg-zinc-800 border-zinc-700 p-4">
                      <div className="flex items-start justify-between mb-4">
                        <h4 className="text-lg font-medium text-white">Task {index + 1}</h4>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRemoveTask(task.id)}
                          className="border-red-700 text-red-300 hover:bg-red-900/20"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-sm font-medium text-zinc-300 mb-2">
                            Summary *
                          </label>
                          <Input
                            value={task.summary}
                            onChange={(e) => handleTaskChange(task.id, 'summary', e.target.value)}
                            placeholder="Brief task title"
                            className="bg-zinc-700 border-zinc-600 text-white"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-sm font-medium text-zinc-300 mb-2">
                              Type
                            </label>
                            <select
                              value={task.issue_type}
                              onChange={(e) => handleTaskChange(task.id, 'issue_type', e.target.value)}
                              className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-md text-white text-sm"
                            >
                              {issueTypeOptions.map(option => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-zinc-300 mb-2">
                              Priority
                            </label>
                            <select
                              value={task.priority}
                              onChange={(e) => handleTaskChange(task.id, 'priority', e.target.value)}
                              className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-md text-white text-sm"
                            >
                              {priorityOptions.map(option => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-2">
                          Description *
                        </label>
                        <Textarea
                          value={task.description}
                          onChange={(e) => handleTaskChange(task.id, 'description', e.target.value)}
                          placeholder="Detailed task description"
                          rows={3}
                          className="bg-zinc-700 border-zinc-600 text-white"
                        />
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {!isLoading && !creationResult && (
          <div className="p-6 border-t border-zinc-800">
            <div className="flex items-center justify-between">
              <p className="text-sm text-zinc-400">
                {tasks.filter(t => t.summary.trim() && t.description.trim()).length} of {tasks.length} tasks are ready to create
              </p>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={handleClose}
                  disabled={isCreating}
                  className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateTasks}
                  disabled={isCreating || tasks.length === 0}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating Tasks...
                    </>
                  ) : (
                    `Create ${tasks.filter(t => t.summary.trim() && t.description.trim()).length} Tasks in JIRA`
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}

        {creationResult && (
          <div className="p-6 border-t border-zinc-800">
            <div className="flex justify-end">
              <Button
                onClick={handleClose}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
