// Database types for Supabase tables
// This file defines the structure of your database tables

export const databaseTypes = {
  // User profile table
  profiles: {
    id: 'uuid', // References auth.users.id
    email: 'text',
    full_name: 'text',
    avatar_url: 'text',
    company: 'text',
    role: 'text',
    created_at: 'timestamp',
    updated_at: 'timestamp'
  },

  // Meetings table
  meetings: {
    id: 'uuid',
    user_id: 'uuid', // References profiles.id
    title: 'text',
    description: 'text',
    meeting_url: 'text',
    platform: 'text', // 'google_meet', 'zoom', 'teams'
    status: 'text', // 'scheduled', 'in_progress', 'completed', 'cancelled'
    scheduled_at: 'timestamp',
    started_at: 'timestamp',
    ended_at: 'timestamp',
    duration: 'integer', // in minutes
    participants: 'jsonb', // Array of participant objects
    created_at: 'timestamp',
    updated_at: 'timestamp'
  },

  // Transcriptions table
  transcriptions: {
    id: 'uuid',
    meeting_id: 'uuid', // References meetings.id
    speaker: 'text',
    text: 'text',
    timestamp: 'timestamp',
    confidence: 'float',
    language: 'text',
    is_final: 'boolean',
    created_at: 'timestamp'
  },

  // Meeting summaries table
  meeting_summaries: {
    id: 'uuid',
    meeting_id: 'uuid', // References meetings.id
    summary: 'text',
    key_points: 'jsonb', // Array of key points
    action_items: 'jsonb', // Array of action items
    decisions: 'jsonb', // Array of decisions made
    created_at: 'timestamp',
    updated_at: 'timestamp'
  },

  // API keys table (for Vexa integration)
  api_keys: {
    id: 'uuid',
    user_id: 'uuid', // References profiles.id
    key_name: 'text',
    key_value: 'text', // Encrypted
    service: 'text', // 'vexa', 'openai', etc.
    is_active: 'boolean',
    created_at: 'timestamp',
    updated_at: 'timestamp'
  }
}

// Example usage in components:
/*
import { databaseTypes } from '@/types/database'

// Type checking for form data
const validateMeetingData = (data) => {
  const requiredFields = ['title', 'meeting_url', 'platform', 'scheduled_at']
  return requiredFields.every(field => data[field])
}

// Type checking for API responses
const isMeetingData = (data) => {
  return data && typeof data.id === 'string' && typeof data.title === 'string'
}
*/
