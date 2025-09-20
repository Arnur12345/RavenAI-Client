import { supabase } from './supabase'

// Helper function to create base64 auth string that works in both browser and Node.js
const createBase64Auth = (email, apiToken) => {
  const authString = `${email || 'api'}:${apiToken}`
  
  // Check if we're in browser environment
  if (typeof window !== 'undefined' && typeof btoa !== 'undefined') {
    return btoa(authString)
  }
  
  // Check if we're in Node.js environment
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(authString).toString('base64')
  }
  
  // Fallback (shouldn't reach here in normal usage)
  throw new Error('Neither btoa nor Buffer is available for base64 encoding')
}

// JIRA Service for managing credentials and creating tasks
export const jiraService = {
  // Store or update JIRA credentials for a user
  async storeJiraCredentials(userId, credentials) {
    try {
      const { domain, apiToken, projectKey } = credentials
      
      // Check if credentials already exist
      const { data: existing } = await supabase
        .from('jira_credentials')
        .select('id')
        .eq('user_id', userId)
        .single()

      let result
      if (existing) {
        // Update existing credentials
        result = await supabase
          .from('jira_credentials')
          .update({
            domain,
            api_token: apiToken,
            project_key: projectKey,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', userId)
          .select()
          .single()
      } else {
        // Insert new credentials
        result = await supabase
          .from('jira_credentials')
          .insert({
            user_id: userId,
            domain,
            api_token: apiToken,
            project_key: projectKey
          })
          .select()
          .single()
      }

      if (result.error) throw result.error
      return { data: result.data, error: null }
    } catch (error) {
      console.error('Store JIRA credentials error:', error)
      return { data: null, error }
    }
  },

  // Get JIRA credentials for a user
  async getJiraCredentials(userId) {
    try {
      const { data, error } = await supabase
        .from('jira_credentials')
        .select('*')
        .eq('user_id', userId)
        .single()
      
      if (error && error.code !== 'PGRST116') throw error // PGRST116 is "not found"
      return { data, error: null }
    } catch (error) {
      console.error('Get JIRA credentials error:', error)
      return { data: null, error }
    }
  },

  // Validate JIRA credentials by testing connection
  async validateJiraCredentials(credentials) {
    try {
      const { domain, apiToken, email } = credentials
      
      // Create base64 auth string (works in both browser and Node.js)
      const auth = createBase64Auth(email, apiToken)
      
      // Ensure domain doesn't have protocol
      const cleanDomain = domain.replace(/^https?:\/\//, '')
      
      const response = await fetch(`https://${cleanDomain}/rest/api/3/myself`, {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`JIRA API validation failed (${response.status}): ${errorText}`)
      }

      const userData = await response.json()
      return { 
        valid: true, 
        user: userData,
        error: null 
      }
    } catch (error) {
      console.error('JIRA credentials validation error:', error)
      return { 
        valid: false, 
        user: null,
        error: error.message 
      }
    }
  },

  // Create a single task in JIRA
  async createJiraTask(task, credentials) {
    try {
      const { domain, apiToken, email } = credentials
      
      // Create base64 auth string (works in both browser and Node.js)
      const auth = createBase64Auth(email, apiToken)
      
      // Ensure domain doesn't have protocol
      const cleanDomain = domain.replace(/^https?:\/\//, '')
      
      const jiraPayload = {
        fields: {
          project: {
            key: task.project_key || credentials.projectKey || credentials.project_key
          },
          summary: task.summary || task.title, // Support both summary and title fields
          description: {
            type: 'doc',
            version: 1,
            content: [
              {
                type: 'paragraph',
                content: [
                  {
                    type: 'text',
                    text: task.description
                  }
                ]
              }
            ]
          },
          issuetype: {
            name: task.issue_type || 'Task'
          },
          priority: {
            name: task.priority || 'Medium'
          },
          labels: task.labels || []
        }
      }
      
      const response = await fetch(`https://${cleanDomain}/rest/api/3/issue`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(jiraPayload)
      })
      
      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`JIRA API error (${response.status}): ${errorText}`)
      }
      
      const result = await response.json()
      console.log(`✅ Created JIRA task: ${result.key} - ${task.summary || task.title}`)
      return { data: result, error: null }
    } catch (error) {
      console.error(`❌ Failed to create JIRA task "${task.summary || task.title}":`, error)
      return { data: null, error }
    }
  },

  // Create multiple tasks in JIRA
  async createJiraTasks(tasks, credentials) {
    console.log(`🚀 Creating ${tasks.length} tasks in JIRA...`)
    
    const results = []
    const errors = []
    
    for (let i = 0; i < tasks.length; i++) {
      const task = tasks[i]
      try {
        console.log(`📝 Creating task ${i + 1}/${tasks.length}: ${task.summary || task.title}`)
        const result = await this.createJiraTask(task, credentials)
        
        if (result.error) {
          throw result.error
        }
        
        results.push(result.data)
        
        // Add a small delay to avoid rate limiting
        if (i < tasks.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 500))
        }
      } catch (error) {
        const errorMsg = `Task ${i + 1} (${task.summary || task.title}): ${error.message || 'Unknown error'}`
        errors.push(errorMsg)
        console.error(`❌ ${errorMsg}`)
      }
    }
    
    console.log(`📊 Summary:`)
    console.log(`✅ Successfully created: ${results.length} tasks`)
    if (errors.length > 0) {
      console.log(`❌ Failed to create: ${errors.length} tasks`)
      errors.forEach(error => console.log(`   - ${error}`))
    }
    
    return {
      successful: results,
      failed: errors,
      total: tasks.length
    }
  },

  // Delete JIRA credentials for a user
  async deleteJiraCredentials(userId) {
    try {
      const { error } = await supabase
        .from('jira_credentials')
        .delete()
        .eq('user_id', userId)
      
      if (error) throw error
      return { success: true, error: null }
    } catch (error) {
      console.error('Delete JIRA credentials error:', error)
      return { success: false, error }
    }
  }
}
