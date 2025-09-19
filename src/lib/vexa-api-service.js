// Vexa API Service - Enhanced version of transcription service specifically for Vexa API
import { getApiKey, getApiBaseUrl } from './transcription-service.js';

import { parseMeetingUrl } from './utils.js';

// Helper function to handle API responses
async function handleApiResponse(response) {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    
    // Specific handling for 409 conflict (existing bot)
    if (response.status === 409) {
      const error = new Error(`A bot is already running for this meeting: ${errorData.detail || "Please stop the existing bot first"}`);
      error.name = "ExistingBotError";
      error.status = 409;
      throw error;
    }
    
    // Handle authentication errors
    if (response.status === 401) {
      const error = new Error("Invalid API key. Please check your Vexa API configuration.");
      error.name = "AuthenticationError";
      error.status = 401;
      throw error;
    }
    
    // Handle rate limiting
    if (response.status === 429) {
      const error = new Error("Rate limit exceeded. Please try again later.");
      error.name = "RateLimitError";
      error.status = 429;
      throw error;
    }
    
    throw new Error(`API error: ${response.status} ${response.statusText} - ${errorData.detail || errorData.message || "Unknown error"}`);
  }
  return response.json();
}

// Function to get headers with Vexa API key
function getHeaders() {
  const apiKey = getApiKey();
  
  if (!apiKey) {
    throw new Error("No API key found. Please configure your Vexa API key in settings.");
  }
  
  return {
    "Content-Type": "application/json",
    "X-API-Key": apiKey
  };
}

// Get the API base URL
function getBaseUrl() {
  const baseUrl = getApiBaseUrl();
  if (!baseUrl) {
    throw new Error("No API base URL configured. Please check your environment variables.");
  }
  return baseUrl;
}

/**
 * Start a meeting bot using Vexa API
 * @param {Object} meetingData - Meeting configuration
 * @param {string} meetingData.meetingUrl - Full meeting URL
 * @param {string} meetingData.platform - Platform identifier (google_meet, microsoft_teams, zoom)
 * @param {string} [meetingData.language] - Language code (optional, auto-detect if not provided)
 * @param {string} [meetingData.botName] - Custom bot name
 * @param {string} [meetingData.description] - Meeting description (for internal tracking)
 */
export async function startMeetingBot(meetingData) {
  try {
    const { meetingUrl, platform, language, botName, description } = meetingData;
    
    // Parse the meeting URL to get the native meeting ID
    const { nativeMeetingId } = parseMeetingUrl(meetingUrl);
    
    // Build the request payload according to Vexa API spec
    const requestPayload = {
      platform,
      native_meeting_id: nativeMeetingId,
    };
    
    // Add optional fields if provided
    if (language && language !== 'auto') {
      requestPayload.language = language;
    }
    
    if (botName) {
      requestPayload.bot_name = botName;
    }
    
    console.log('Starting meeting bot with payload:', { 
      ...requestPayload, 
      description 
    });
    
    const response = await fetch(`${getBaseUrl()}/bots`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(requestPayload),
    });

    const result = await handleApiResponse(response);
    
    // Return standardized response
    return {
      success: true,
      meetingId: `${platform}/${nativeMeetingId}`,
      data: result,
      description
    };
  } catch (error) {
    console.error("Error starting meeting bot:", error);
    throw error;
  }
}

/**
 * Stop a meeting bot
 * @param {string} meetingId - Meeting ID in format "platform/nativeMeetingId"
 */
export async function stopMeetingBot(meetingId) {
  try {
    const parts = meetingId.split('/');
    if (parts.length < 2) {
      throw new Error("Invalid meeting ID format");
    }
    
    const platform = parts[0];
    const nativeMeetingId = parts[1];

    console.log(`Stopping bot for ${platform}/${nativeMeetingId}`);

    const response = await fetch(`${getBaseUrl()}/bots/${platform}/${nativeMeetingId}`, {
      method: "DELETE",
      headers: getHeaders(),
    });

    const result = await handleApiResponse(response);

    return {
      success: true,
      data: result
    };
  } catch (error) {
    console.error("Error stopping meeting bot:", error);
    throw error;
  }
}

/**
 * Get real-time transcript for a meeting
 * @param {string} meetingId - Meeting ID in format "platform/nativeMeetingId"
 */
export async function getMeetingTranscript(meetingId) {
  try {
    const parts = meetingId.split('/');
    if (parts.length < 2) {
      throw new Error("Invalid meeting ID format");
    }
    
    const platform = parts[0];
    const nativeMeetingId = parts[1];

    console.log(`Fetching transcript for ${platform}/${nativeMeetingId}`);

    const response = await fetch(`${getBaseUrl()}/transcripts/${platform}/${nativeMeetingId}`, {
      method: "GET",
      headers: getHeaders(),
    });

    const data = await handleApiResponse(response);
    
    // Transform the API response to our standard format
    const segments = data.segments || [];
    
    return {
      meetingId,
      language: data.language || "en",
      segments: segments.map((segment, index) => ({
        id: `segment-${index}-${segment.absolute_start_time || Date.now()}`,
        text: segment.text || "",
        timestamp: segment.absolute_start_time || new Date().toISOString(),
        speaker: segment.speaker || "Unknown",
        startTime: segment.start || 0,
        endTime: segment.end || 0
      })),
      status: "active",
      lastUpdated: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Error getting meeting transcript:", error);
    throw error;
  }
}

/**
 * Get list of running bots
 */
export async function getRunningBots() {
  try {
    const response = await fetch(`${getBaseUrl()}/bots/status`, {
      method: "GET",
      headers: getHeaders(),
    });

    const data = await handleApiResponse(response);
    return data;
  } catch (error) {
    console.error("Error getting running bots:", error);
    throw error;
  }
}

/**
 * Update bot configuration (e.g., change language)
 * @param {string} meetingId - Meeting ID in format "platform/nativeMeetingId"
 * @param {Object} config - Configuration to update
 * @param {string} [config.language] - New language code
 */
export async function updateBotConfig(meetingId, config) {
  try {
    const parts = meetingId.split('/');
    if (parts.length < 2) {
      throw new Error("Invalid meeting ID format");
    }
    
    const platform = parts[0];
    const nativeMeetingId = parts[1];

    console.log(`Updating bot config for ${platform}/${nativeMeetingId}:`, config);

    const response = await fetch(`${getBaseUrl()}/bots/${platform}/${nativeMeetingId}/config`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(config),
    });

    const result = await handleApiResponse(response);

    return {
      success: true,
      data: result
    };
  } catch (error) {
    console.error("Error updating bot config:", error);
    throw error;
  }
}

/**
 * Get meeting history
 */
export async function getMeetingHistory() {
  try {
    const response = await fetch(`${getBaseUrl()}/meetings`, {
      method: "GET",
      headers: getHeaders(),
    });

    const data = await handleApiResponse(response);
    
    // Transform to our standard format
    return data.meetings?.map((meeting) => ({
      id: `${meeting.platform}/${meeting.native_meeting_id}/${meeting.id}`,
      platformId: meeting.platform,
      nativeMeetingId: meeting.native_meeting_id,
      platform: meeting.platform,
      status: meeting.status || "stopped",
      startTime: meeting.start_time || new Date().toISOString(),
      endTime: meeting.end_time,
      title: meeting.data?.name || `Meeting ${meeting.native_meeting_id}`,
      participants: meeting.data?.participants || [],
      languages: meeting.data?.languages || [],
      notes: meeting.data?.notes || ""
    })) || [];
  } catch (error) {
    console.error("Error getting meeting history:", error);
    throw error;
  }
}

/**
 * Update meeting metadata
 * @param {string} meetingId - Meeting ID in format "platform/nativeMeetingId"
 * @param {Object} metadata - Meeting metadata to update
 */
export async function updateMeetingMetadata(meetingId, metadata) {
  try {
    const parts = meetingId.split('/');
    if (parts.length < 2) {
      throw new Error("Invalid meeting ID format");
    }
    
    const platform = parts[0];
    const nativeMeetingId = parts[1];

    const response = await fetch(`${getBaseUrl()}/meetings/${platform}/${nativeMeetingId}`, {
      method: "PATCH",
      headers: getHeaders(),
      body: JSON.stringify({ data: metadata }),
    });

    const result = await handleApiResponse(response);

    return {
      success: true,
      data: result
    };
  } catch (error) {
    console.error("Error updating meeting metadata:", error);
    throw error;
  }
}
