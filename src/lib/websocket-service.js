import { getApiKey, getWebSocketUrl } from "./transcription-service.js"

// WebSocket service class
export class TranscriptionWebSocketService {
  constructor() {
    this.ws = null
    this.reconnectAttempts = 0
    this.maxReconnectAttempts = 5
    this.reconnectDelay = 1000
    this.pingInterval = null
    this.isConnecting = false
    this.subscribedMeetings = new Set()
    
    // Event handlers
    this.onTranscriptMutable = null
    this.onTranscriptFinalized = null
    this.onMeetingStatus = null
    this.onError = null
    this.onConnected = null
    this.onDisconnected = null

    // Bind methods to preserve context
    this.handleMessage = this.handleMessage.bind(this)
    this.handleOpen = this.handleOpen.bind(this)
    this.handleClose = this.handleClose.bind(this)
    this.handleError = this.handleError.bind(this)
  }

  // Set event handlers
  setOnTranscriptMutable(handler) {
    this.onTranscriptMutable = handler
  }

  setOnTranscriptFinalized(handler) {
    this.onTranscriptFinalized = handler
  }

  setOnMeetingStatus(handler) {
    this.onMeetingStatus = handler
  }

  setOnError(handler) {
    this.onError = handler
  }

  setOnConnected(handler) {
    this.onConnected = handler
  }

  setOnDisconnected(handler) {
    this.onDisconnected = handler
  }

  // Connect to WebSocket
  async connect() {
    if (this.ws?.readyState === WebSocket.OPEN || this.isConnecting) {
      return
    }

    this.isConnecting = true

    try {
      const apiKey = getApiKey()
      if (!apiKey) {
        throw new Error("No API key available")
      }

      // Get WebSocket URL from user settings
      const wsUrl = getWebSocketUrl()
      const url = `${wsUrl}?api_key=${encodeURIComponent(apiKey)}`

      console.log("Connecting to WebSocket:", url.replace(apiKey, "***"))

      this.ws = new WebSocket(url)
      this.ws.onopen = this.handleOpen
      this.ws.onmessage = this.handleMessage
      this.ws.onclose = this.handleClose
      this.ws.onerror = this.handleError
      
      // Add a timeout to detect connection failures
      const connectionTimeout = setTimeout(() => {
        if (this.ws && this.ws.readyState === WebSocket.CONNECTING) {
          console.error("WebSocket connection timeout")
          this.ws.close()
          this.isConnecting = false
        }
      }, 10000) // 10 second timeout
      
      this.ws.addEventListener('open', () => {
        clearTimeout(connectionTimeout)
      })
      
      this.ws.addEventListener('error', () => {
        clearTimeout(connectionTimeout)
      })

    } catch (error) {
      console.error("Failed to connect to WebSocket:", error)
      this.isConnecting = false
      throw error
    }
  }

  // Disconnect from WebSocket
  disconnect() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval)
      this.pingInterval = null
    }

    if (this.ws) {
      this.ws.close()
      this.ws = null
    }

    this.subscribedMeetings.clear()
    this.reconnectAttempts = 0
    this.isConnecting = false
  }

  // Subscribe to meeting events
  async subscribeToMeeting(meetingId) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      throw new Error("WebSocket not connected")
    }

    const subscribeMessage = {
      action: "subscribe",
      meetings: [{ id: meetingId }]
    }

    this.ws.send(JSON.stringify(subscribeMessage))
    this.subscribedMeetings.add(meetingId)
    
    console.log("Subscribed to meeting:", meetingId)
  }

  // Unsubscribe from meeting events
  async unsubscribeFromMeeting(meetingId) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      return
    }

    const unsubscribeMessage = {
      action: "unsubscribe",
      meetings: [{ id: meetingId }]
    }

    this.ws.send(JSON.stringify(unsubscribeMessage))
    this.subscribedMeetings.delete(meetingId)
    
    console.log("Unsubscribed from meeting:", meetingId)
  }

  // Check if connected
  isConnected() {
    return this.ws?.readyState === WebSocket.OPEN
  }

  // Get subscribed meetings
  getSubscribedMeetings() {
    return Array.from(this.subscribedMeetings)
  }

  // Private methods
  handleOpen() {
    console.log("WebSocket connected")
    this.isConnecting = false
    this.reconnectAttempts = 0
    
    // Start ping interval
    this.pingInterval = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ action: "ping" }))
      }
    }, 25000) // Ping every 25 seconds

    this.onConnected?.()
  }

  handleMessage(event) {
    try {
      const data = JSON.parse(event.data)
      console.log("WebSocket message received:", data.type)

      switch (data.type) {
        case "transcript.mutable":
          this.onTranscriptMutable?.(data)
          break
        case "transcript.finalized":
          this.onTranscriptFinalized?.(data)
          break
        case "meeting.status":
          this.onMeetingStatus?.(data)
          break
        case "subscribed":
          console.log("Subscribed to meetings:", data.payload.meetings)
          break
        case "pong":
          // Connection is alive
          break
        case "error":
          this.onError?.(data)
          break
        default:
          console.warn("Unknown WebSocket event type:", data.type)
      }
    } catch (error) {
      console.error("Failed to parse WebSocket message:", error)
    }
  }

  handleClose(event) {
    console.log("WebSocket disconnected:", event.code, event.reason)
    this.isConnecting = false

    if (this.pingInterval) {
      clearInterval(this.pingInterval)
      this.pingInterval = null
    }

    this.onDisconnected?.()

    // Attempt to reconnect if not a clean close
    if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
      this.attemptReconnect()
    }
  }

  handleError(error) {
    console.error("WebSocket error:", error)
    console.error("WebSocket error details:", {
      type: error.type,
      target: error.target,
      currentTarget: error.currentTarget,
      timeStamp: error.timeStamp
    })
    this.isConnecting = false
  }

  attemptReconnect() {
    this.reconnectAttempts++
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1)
    
    console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`)
    
    setTimeout(() => {
      if (this.reconnectAttempts <= this.maxReconnectAttempts) {
        this.connect().catch(console.error)
      }
    }, delay)
  }
}

// Singleton instance
let wsServiceInstance = null

export function getWebSocketService() {
  if (!wsServiceInstance) {
    wsServiceInstance = new TranscriptionWebSocketService()
  }
  return wsServiceInstance
}

// Helper function to convert WebSocket segments to our format
export function convertWebSocketSegment(segment, meetingId) {
  // Create a stable ID based on start time and text
  const stableId = `${segment.start}-${segment.text.slice(0, 20).replace(/\s+/g, '-')}`
  
  // Convert start time to ISO timestamp (assuming it's relative to meeting start)
  const timestamp = new Date(Date.now() - (Date.now() - segment.start * 1000)).toISOString()
  
  return {
    id: stableId,
    text: segment.text || "",
    timestamp: timestamp,
    speaker: segment.speaker || "Unknown",
  }
}
