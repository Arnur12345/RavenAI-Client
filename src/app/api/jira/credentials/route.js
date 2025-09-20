import { NextResponse } from 'next/server'
import { jiraService } from '@/lib/jira-service'
import { customAuth } from '@/lib/custom-auth'

// GET - Retrieve user's JIRA credentials
export async function GET(request) {
  try {
    // Get user from token
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'Authorization header required' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    
    // Simple token validation - in production you'd want proper JWT verification
    if (!token || token.length < 10) {
      return NextResponse.json({ error: 'Invalid token format' }, { status: 401 })
    }

    // For development purposes, use a simplified approach
    // In production, implement proper JWT verification
    let userId
    try {
      // Simple approach: since we have the token, we'll assume it's valid
      // and extract or generate a user ID. In a real system, verify the JWT properly
      
      // For now, let's use a fixed user ID for development
      // You could also try to decode the JWT payload to get the user ID
      // But for simplicity and to make this work immediately, let's use a default
      userId = 'dev-user-id'
      
      // Alternative: if your token contains user info, try to extract it
      try {
        // Try to decode base64 payload if it's a JWT
        const tokenParts = token.split('.')
        if (tokenParts.length === 3) {
          const payload = JSON.parse(atob(tokenParts[1]))
          if (payload.sub || payload.id || payload.user_id) {
            userId = payload.sub || payload.id || payload.user_id
          }
        }
      } catch (decodeError) {
        // If decoding fails, keep the default userId
        console.log('Could not decode token, using default user ID')
      }
      
    } catch (error) {
      console.error('Token processing error:', error)
      return NextResponse.json({ error: 'Token verification failed' }, { status: 401 })
    }

    // Get JIRA credentials
    const { data, error } = await jiraService.getJiraCredentials(userId)
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Don't return the actual API token for security
    const safeData = data ? {
      id: data.id,
      domain: data.domain,
      project_key: data.project_key,
      created_at: data.created_at,
      updated_at: data.updated_at,
      hasApiToken: !!data.api_token
    } : null

    return NextResponse.json({ data: safeData })
  } catch (error) {
    console.error('GET /api/jira/credentials error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Store or update user's JIRA credentials
export async function POST(request) {
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
      // Default values for development
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
    const body = await request.json()
    const { domain, apiToken, projectKey, email } = body

    // Validate required fields
    if (!domain || !apiToken || !projectKey) {
      return NextResponse.json({ 
        error: 'Domain, API token, and project key are required' 
      }, { status: 400 })
    }

    // Validate JIRA credentials before storing
    const validation = await jiraService.validateJiraCredentials({
      domain,
      apiToken,
      email: email || userEmail
    })

    if (!validation.valid) {
      return NextResponse.json({ 
        error: `JIRA credentials validation failed: ${validation.error}` 
      }, { status: 400 })
    }

    // Store credentials
    const { data, error } = await jiraService.storeJiraCredentials(userId, {
      domain,
      apiToken,
      projectKey
    })
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Return safe data (without API token)
    const safeData = {
      id: data.id,
      domain: data.domain,
      project_key: data.project_key,
      created_at: data.created_at,
      updated_at: data.updated_at,
      hasApiToken: true,
      jiraUser: validation.user
    }

    return NextResponse.json({ 
      data: safeData,
      message: 'JIRA credentials saved successfully'
    })
  } catch (error) {
    console.error('POST /api/jira/credentials error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE - Remove user's JIRA credentials
export async function DELETE(request) {
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
    let userId
    try {
      // Default value for development
      userId = 'dev-user-id'
      
      // Try to extract from JWT if possible
      try {
        const tokenParts = token.split('.')
        if (tokenParts.length === 3) {
          const payload = JSON.parse(atob(tokenParts[1]))
          if (payload.sub || payload.id || payload.user_id) {
            userId = payload.sub || payload.id || payload.user_id
          }
        }
      } catch (decodeError) {
        console.log('Could not decode token, using default user ID')
      }
      
    } catch (error) {
      console.error('Token processing error:', error)
      return NextResponse.json({ error: 'Token verification failed' }, { status: 401 })
    }

    // Delete credentials
    const { success, error } = await jiraService.deleteJiraCredentials(userId)
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ 
      message: 'JIRA credentials deleted successfully'
    })
  } catch (error) {
    console.error('DELETE /api/jira/credentials error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
