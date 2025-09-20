// Llama4Scout integration for processing meeting transcripts and generating JIRA tasks
// This uses the existing API endpoint that handles Llama integration

export const llamaService = {
  // Process meeting transcripts and generate JIRA tasks using existing API
  async generateTasksFromTranscript(transcriptSegments, meetingTitle = '') {
    try {
      // Combine all transcript segments into a single text
      const fullTranscript = transcriptSegments
        .map(segment => `${segment.speaker || 'Speaker'}: ${segment.text}`)
        .join('\n')

      console.log('🤖 Sending transcript to API for task generation...')
      
      // Use the existing API endpoint that handles Llama integration
      // This follows the same pattern as taskCreater.ts and utilsForTask.ts
      const response = await fetch('/api/process-meeting-summary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          transcript: fullTranscript,
          meetingTitle: meetingTitle
        })
      })

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`)
      }

      const result = await response.json()
      
      console.log('🔍 Parsing generated tasks from API response...')
      const tasks = this.parseTasksFromResponse(result.data || result)
      
      console.log(`✅ Successfully generated ${tasks.length} tasks from transcript`)
      return { data: tasks, error: null }
    } catch (error) {
      console.error('❌ Error generating tasks from transcript:', error)
      return { data: null, error }
    }
  },

  // Get the system prompt for task generation
  getSystemPrompt() {
    return `You are a task generator that analyzes meeting transcripts and creates actionable JIRA tasks. Based on the provided meeting transcript, create a JSON array of tasks that capture action items, decisions, and follow-ups discussed in the meeting.

IMPORTANT INSTRUCTIONS:
- Return ONLY valid JSON, no explanations, no markdown, no additional text
- Do not include any text before or after the JSON
- Each task should be a simple object with only summary and description fields
- Focus on actionable items, decisions made, and follow-up tasks
- Ignore general discussion that doesn't lead to specific actions
- Make summaries concise but descriptive
- Make descriptions detailed and specific

Required JSON format:
{
  "summary": "Brief, actionable task title",
  "description": "Detailed task description with context from the meeting"
}

Example output format:
[
  {
    "summary": "Fix login authentication bug",
    "description": "Resolve the authentication issue discussed where users are unable to log in after password reset. This was identified as a high priority issue affecting multiple users."
  },
  {
    "summary": "Implement push notification feature",
    "description": "Develop push notification functionality for mobile apps as discussed in the meeting. Should include user preferences and notification scheduling capabilities."
  }
]

Return only the JSON array with summary and description fields, nothing else.`
  },

  // Format the user message with transcript and context
  formatUserMessage(transcript, meetingTitle) {
    return `Please analyze the following meeting transcript and generate actionable JIRA tasks:

Meeting Title: ${meetingTitle || 'Meeting'}

Transcript:
${transcript}

Generate tasks based on action items, decisions, and follow-ups discussed in this meeting.`
  },

  // Parse tasks from Llama response
  parseTasksFromResponse(response) {
    try {
      // Clean the response - remove any markdown formatting
      let jsonString = response.trim()
      
      // Remove markdown code blocks if present
      jsonString = jsonString.replace(/```json\s*/, '').replace(/```\s*$/, '')
      
      console.log('🔍 Parsing Llama response:', jsonString.substring(0, 200) + '...')
      
      const tasks = JSON.parse(jsonString)
      
      if (!Array.isArray(tasks)) {
        throw new Error('Llama response is not an array of tasks')
      }
      
      // Validate each task has required fields
      tasks.forEach((task, index) => {
        const requiredFields = ['summary', 'description']
        for (const field of requiredFields) {
          if (!task[field]) {
            throw new Error(`Task ${index + 1} is missing required field: ${field}`)
          }
        }
      })
      
      // Add default values for JIRA-specific fields
      const jiraTasks = tasks.map(task => ({
        summary: task.summary,
        description: task.description,
        issue_type: 'Task',
        priority: 'Medium',
        labels: []
      }))
      
      console.log(`✅ Successfully parsed ${jiraTasks.length} tasks from Llama response`)
      return jiraTasks
    } catch (error) {
      console.error('❌ Error parsing Llama response:', error)
      throw new Error(`Failed to parse tasks from Llama: ${error.message}`)
    }
  },

  // Test function to validate Llama API connection
  async testConnection() {
    try {
      if (!LLAMA_API_KEY) {
        throw new Error('LLAMA_API_KEY is not configured')
      }

      const response = await fetch(LLAMA_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${LLAMA_API_KEY}`
        },
        body: JSON.stringify({
          model: 'llama4scout',
          messages: [
            {
              role: 'user',
              content: 'Hello, this is a test message.'
            }
          ],
          max_tokens: 50
        })
      })

      if (!response.ok) {
        throw new Error(`Llama API test failed: ${response.status}`)
      }

      const result = await response.json()
      return { 
        connected: true, 
        response: result.choices[0]?.message?.content || 'No response',
        error: null 
      }
    } catch (error) {
      console.error('Llama API test error:', error)
      return { 
        connected: false, 
        response: null,
        error: error.message 
      }
    }
  }
}
