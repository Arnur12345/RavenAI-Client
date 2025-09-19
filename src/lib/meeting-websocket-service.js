// Enhanced WebSocket service specifically for real-time meeting transcripts with Vexa API
import { getApiKey } from './transcription-service.js';

export class MeetingWebSocketService {
  constructor(meetingId) {
    this.meetingId = meetingId;
    this.ws = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;
    this.pingInterval = null;
    this.isConnecting = false;
    this.isConnected = false;
    
    // Event handlers
    this.onTranscriptUpdate = null;
    this.onMeetingStatus = null;
    this.onError = null;
    this.onConnected = null;
    this.onDisconnected = null;

    // Bind methods
    this.handleMessage = this.handleMessage.bind(this);
    this.handleOpen = this.handleOpen.bind(this);
    this.handleClose = this.handleClose.bind(this);
    this.handleError = this.handleError.bind(this);
  }

  // Set event handlers
  setOnTranscriptUpdate(handler) {
    this.onTranscriptUpdate = handler;
  }

  setOnMeetingStatus(handler) {
    this.onMeetingStatus = handler;
  }

  setOnError(handler) {
    this.onError = handler;
  }

  setOnConnected(handler) {
    this.onConnected = handler;
  }

  setOnDisconnected(handler) {
    this.onDisconnected = handler;
  }

  // Connect to WebSocket for real-time updates
  async connect() {
    if (this.ws?.readyState === WebSocket.OPEN || this.isConnecting) {
      return;
    }

    // Check if WebSocket is available (browser environment)
    if (typeof WebSocket === 'undefined') {
      throw new Error("WebSocket is not available in this environment");
    }

    this.isConnecting = true;

    try {
      const apiKey = getApiKey();
      if (!apiKey) {
        throw new Error("No API key available for WebSocket connection");
      }

      // Extract platform and native meeting ID from meetingId
      const [platform, nativeMeetingId] = this.meetingId.split('/');
      
      if (!platform || !nativeMeetingId) {
        throw new Error(`Invalid meeting ID format: ${this.meetingId}. Expected format: platform/nativeMeetingId`);
      }
      
      // Use WebSocket URL from environment or default
      const wsBaseUrl = process.env.NEXT_PUBLIC_VEXA_WS_URL || 'wss://api.cloud.vexa.ai/ws';
      
      // Check if the WebSocket URL looks valid
      if (!wsBaseUrl.startsWith('ws://') && !wsBaseUrl.startsWith('wss://')) {
        throw new Error(`Invalid WebSocket URL format: ${wsBaseUrl}. Must start with ws:// or wss://`);
      }
      
      const wsUrl = `${wsBaseUrl}/meetings/${platform}/${nativeMeetingId}?api_key=${encodeURIComponent(apiKey)}`;

      console.log('Connecting to meeting WebSocket:', {
        baseUrl: wsBaseUrl,
        platform: platform,
        nativeMeetingId: nativeMeetingId,
        fullUrl: wsUrl.replace(apiKey, "***"),
        hasApiKey: !!apiKey
      });

      this.ws = new WebSocket(wsUrl);
      this.ws.onopen = this.handleOpen;
      this.ws.onmessage = this.handleMessage;
      this.ws.onclose = this.handleClose;
      this.ws.onerror = this.handleError;
      
      // Add a connection state check after a short delay
      setTimeout(() => {
        if (this.ws && this.ws.readyState === WebSocket.CONNECTING) {
          console.log('WebSocket still connecting after 2 seconds...');
        }
      }, 2000);
      
      // Connection timeout
      const connectionTimeout = setTimeout(() => {
        if (this.ws && this.ws.readyState === WebSocket.CONNECTING) {
          console.error("WebSocket connection timeout");
          this.ws.close();
          this.isConnecting = false;
        }
      }, 10000);
      
      this.ws.addEventListener('open', () => {
        clearTimeout(connectionTimeout);
      });
      
      this.ws.addEventListener('error', () => {
        clearTimeout(connectionTimeout);
      });

    } catch (error) {
      console.error("Failed to connect to meeting WebSocket:", error);
      this.isConnecting = false;
      throw error;
    }
  }

  // Disconnect from WebSocket
  disconnect() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    this.reconnectAttempts = 0;
    this.isConnecting = false;
    this.isConnected = false;
  }

  // Check if connected
  getConnectionStatus() {
    return {
      connected: this.isConnected,
      meetingId: this.meetingId
    };
  }

  // Private event handlers
  handleOpen() {
    console.log("Meeting WebSocket connected for:", this.meetingId);
    this.isConnecting = false;
    this.isConnected = true;
    this.reconnectAttempts = 0;
    
    // Start ping interval to keep connection alive
    this.pingInterval = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: "ping" }));
      }
    }, 25000);

    this.onConnected?.();
  }

  handleMessage(event) {
    try {
      const data = JSON.parse(event.data);
      console.log("Meeting WebSocket message received:", data.type);

      switch (data.type) {
        case "transcript_update":
          // Real-time transcript segments
          if (data.segments && this.onTranscriptUpdate) {
            const segments = data.segments.map((segment, index) => ({
              id: `ws-${data.timestamp}-${index}`,
              text: segment.text || "",
              timestamp: segment.absolute_start_time || new Date().toISOString(),
              speaker: segment.speaker || "Unknown",
              startTime: segment.start || 0,
              endTime: segment.end || 0,
              isFinal: segment.is_final || false
            }));
            this.onTranscriptUpdate(segments);
          }
          break;

        case "meeting_status":
          // Meeting status updates (started, stopped, etc.)
          this.onMeetingStatus?.(data.status);
          break;

        case "error":
          this.onError?.(new Error(data.message || "WebSocket error"));
          break;

        case "pong":
          // Keep-alive response
          break;

        default:
          console.warn("Unknown WebSocket message type:", data.type);
      }
    } catch (error) {
      console.error("Failed to parse WebSocket message:", error);
    }
  }

  handleClose(event) {
    console.log("Meeting WebSocket disconnected:", event.code, event.reason);
    this.isConnecting = false;
    this.isConnected = false;

    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }

    this.onDisconnected?.();

    // Attempt to reconnect if not a clean close
    if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
      this.attemptReconnect();
    }
  }

  handleError(error) {
    const errorInfo = {
      error: error,
      errorType: typeof error,
      errorMessage: error?.message || 'Unknown WebSocket error',
      readyState: this.ws?.readyState,
      url: this.ws?.url?.replace(/api_key=[^&]+/, 'api_key=***'),
      meetingId: this.meetingId
    };
    
    console.error("Meeting WebSocket error:", errorInfo);
    
    // Provide more specific error messages based on the error
    let userMessage = 'WebSocket connection failed';
    if (this.ws?.readyState === WebSocket.CLOSED) {
      userMessage = 'WebSocket connection was closed unexpectedly';
    } else if (this.ws?.readyState === WebSocket.CONNECTING) {
      userMessage = 'WebSocket connection timed out or failed to establish';
    }
    
    this.isConnecting = false;
    this.isConnected = false;
    
    // Call the error handler if set
    if (this.onError) {
      this.onError(new Error(userMessage));
    }
  }

  attemptReconnect() {
    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
    
    console.log(`Attempting to reconnect meeting WebSocket in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
    
    setTimeout(() => {
      if (this.reconnectAttempts <= this.maxReconnectAttempts) {
        this.connect().catch(console.error);
      }
    }, delay);
  }
}

// Service instance management
const activeServices = new Map();

export function getMeetingWebSocketService(meetingId) {
  if (!activeServices.has(meetingId)) {
    activeServices.set(meetingId, new MeetingWebSocketService(meetingId));
  }
  return activeServices.get(meetingId);
}

export function closeMeetingWebSocketService(meetingId) {
  const service = activeServices.get(meetingId);
  if (service) {
    service.disconnect();
    activeServices.delete(meetingId);
  }
}
