import { NextResponse } from 'next/server'
import { jiraService } from '../../../../lib/jira-service.js'
import { customAuth } from '../../../../lib/custom-auth.js'

console.log('📦 JIRA create-tasks route loaded, jiraService:', typeof jiraService)

// POST - Create tasks in JIRA
export async function POST(request) {
  console.log('🚀 POST /api/jira/create-tasks - Starting...')
  try {
    // Get user from token
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'Authorization header required' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    
    // Simple token validation
    if (!token || token.length < 10) {
      return NextResponse.json({ error: 'Invalid token format' }, { status: 401 })
    }

    // Simplified token verification for development
    let userId, userEmail
    try {
      userId = 'dev-user-id'
      userEmail = 'dev@example.com'
      
      // Try to extract from JWT if possible
      try {
        const tokenParts = token.split('.')
        if (tokenParts.length === 3) {
          const payload = JSON.parse(atob(tokenParts[1]))
          if (payload.sub || payload.id || payload.user_id) {
            userId = payload.sub || payload.id || payload.user_id
          }
          if (payload.email) {
            userEmail = payload.email
          }
        }
      } catch (decodeError) {
        console.log('Could not decode token, using default values')
      }
      
    } catch (error) {
      console.error('Token processing error:', error)
      return NextResponse.json({ error: 'Token verification failed' }, { status: 401 })
    }

    // Get request body
    console.log('📥 Parsing request body...')
    let body
    try {
      body = await request.json()
      console.log('📥 Request body parsed successfully:', { hasTasksArray: Array.isArray(body.tasks), tasksLength: body.tasks?.length })
    } catch (error) {
      console.error('❌ Error parsing request body:', error)
      return NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 })
    }
    
    const { tasks } = body

    if (!tasks || !Array.isArray(tasks) || tasks.length === 0) {
      return NextResponse.json({ 
        error: 'Tasks array is required and must not be empty' 
      }, { status: 400 })
    }

    console.log(`🎯 Creating ${tasks.length} tasks in JIRA for user: ${userEmail}`)

    // Get user's JIRA credentials
    console.log('🔑 Fetching JIRA credentials for user:', userId)
    let credentials, credError
    try {
      const result = await jiraService.getJiraCredentials(userId)
      credentials = result.data
      credError = result.error
      console.log('🔑 Credentials fetch result:', { hasData: !!credentials, hasError: !!credError })
    } catch (error) {
      console.error('❌ Error fetching credentials:', error)
      return NextResponse.json({ 
        error: `Failed to fetch JIRA credentials: ${error.message}` 
      }, { status: 500 })
    }
    
    if (credError || !credentials) {
      return NextResponse.json({ 
        error: 'JIRA credentials not found. Please configure JIRA integration first.' 
      }, { status: 404 })
    }

    if (!credentials.domain || !credentials.api_token || !credentials.project_key) {
      console.error('❌ Incomplete JIRA credentials:', {
        hasDomain: !!credentials.domain,
        hasApiToken: !!credentials.api_token,
        hasProjectKey: !!credentials.project_key,
        credentials: credentials
      })
      return NextResponse.json({ 
        error: 'Incomplete JIRA credentials. Please reconfigure JIRA integration.' 
      }, { status: 400 })
    }

    // Validate each task has required fields (support both summary and title)
    for (let i = 0; i < tasks.length; i++) {
      const task = tasks[i]
      if ((!task.summary && !task.title) || !task.description) {
        return NextResponse.json({ 
          error: `Task ${i + 1} is missing required fields (summary/title, description)` 
        }, { status: 400 })
      }
    }

    // Prepare credentials for JIRA API (match the structure expected by jira-service.js)
    const jiraCredentials = {
      domain: credentials.domain,
      apiToken: credentials.api_token,
      email: userEmail,
      projectKey: credentials.project_key,
      project_key: credentials.project_key // Support both formats for backward compatibility
    }

    // Create tasks in JIRA
    console.log('📋 About to create tasks with credentials:', {
      domain: jiraCredentials.domain,
      email: jiraCredentials.email,
      hasApiToken: !!jiraCredentials.apiToken,
      projectKey: jiraCredentials.projectKey
    })
    console.log('📋 Tasks to create:', tasks.length, tasks.map(t => ({ summary: t.summary || t.title, hasDescription: !!t.description })))
    
    let result
    try {
      result = await jiraService.createJiraTasks(tasks, jiraCredentials)
      console.log('✅ JIRA service result:', result)
    } catch (error) {
      console.error('❌ Error calling JIRA service:', error)
      console.error('❌ Error stack:', error.stack)
      return NextResponse.json({ 
        error: `Failed to create JIRA tasks: ${error.message}` 
      }, { status: 500 })
    }

    if (!result || typeof result !== 'object') {
      throw new Error('Invalid result from JIRA service')
    }

    const successful = result.successful || []
    const failed = result.failed || []
    const total = result.total || tasks.length

    const response = {
      data: {
        successful: successful,
        failed: failed,
        total: total,
        successCount: successful.length,
        failureCount: failed.length,
        createdAt: new Date().toISOString()
      }
    }

    if (successful.length > 0) {
      response.message = `Successfully created ${successful.length} out of ${total} tasks in JIRA`
    }

    if (failed.length > 0) {
      response.warning = `${failed.length} tasks failed to create`
      response.data.errors = failed
    }

    const statusCode = successful.length > 0 ? 200 : 500
    return NextResponse.json(response, { status: statusCode })
  } catch (error) {
    console.error('POST /api/jira/create-tasks error:', error)
    console.error('Error stack:', error.stack)
    console.error('Error details:', error.message)
    return NextResponse.json({ 
      error: `Internal server error: ${error.message}`,
      details: error.stack
    }, { status: 500 })
  }
}
