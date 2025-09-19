import { supabase } from './supabase'

export const database = {
  // User profile operations
  async getUserProfile(userId) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()
      
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Get user profile error:', error)
      return { data: null, error }
    }
  },

  async updateUserProfile(userId, updates) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single()
      
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Update user profile error:', error)
      return { data: null, error }
    }
  },

  // Meeting operations
  async createMeeting(meetingData) {
    try {
      const { data, error } = await supabase
        .from('meetings')
        .insert(meetingData)
        .select()
        .single()
      
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Create meeting error:', error)
      return { data: null, error }
    }
  },

  async getMeetings(userId) {
    try {
      const { data, error } = await supabase
        .from('meetings')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Get meetings error:', error)
      return { data: null, error }
    }
  },

  async getMeeting(meetingId) {
    try {
      const { data, error } = await supabase
        .from('meetings')
        .select('*')
        .eq('id', meetingId)
        .single()
      
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Get meeting error:', error)
      return { data: null, error }
    }
  },

  async updateMeeting(meetingId, updates) {
    try {
      const { data, error } = await supabase
        .from('meetings')
        .update(updates)
        .eq('id', meetingId)
        .select()
        .single()
      
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Update meeting error:', error)
      return { data: null, error }
    }
  },

  async deleteMeeting(meetingId) {
    try {
      const { data, error } = await supabase
        .from('meetings')
        .delete()
        .eq('id', meetingId)
        .select()
        .single()
      
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Delete meeting error:', error)
      return { data: null, error }
    }
  },

  // Transcription operations
  async createTranscription(transcriptionData) {
    try {
      const { data, error } = await supabase
        .from('transcriptions')
        .insert(transcriptionData)
        .select()
        .single()
      
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Create transcription error:', error)
      return { data: null, error }
    }
  },

  async getTranscriptions(meetingId) {
    try {
      const { data, error } = await supabase
        .from('transcriptions')
        .select('*')
        .eq('meeting_id', meetingId)
        .order('timestamp', { ascending: true })
      
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Get transcriptions error:', error)
      return { data: null, error }
    }
  },

  // Real-time subscriptions
  subscribeToMeetings(userId, callback) {
    return supabase
      .channel('meetings')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'meetings',
          filter: `user_id=eq.${userId}`
        }, 
        callback
      )
      .subscribe()
  },

  subscribeToTranscriptions(meetingId, callback) {
    return supabase
      .channel('transcriptions')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'transcriptions',
          filter: `meeting_id=eq.${meetingId}`
        }, 
        callback
      )
      .subscribe()
  },

  // File upload operations
  async uploadFile(bucket, path, file) {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(path, file)
      
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Upload file error:', error)
      return { data: null, error }
    }
  },

  async getFileUrl(bucket, path) {
    try {
      const { data } = supabase.storage
        .from(bucket)
        .getPublicUrl(path)
      
      return { data, error: null }
    } catch (error) {
      console.error('Get file URL error:', error)
      return { data: null, error }
    }
  },

  async deleteFile(bucket, path) {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .remove([path])
      
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Delete file error:', error)
      return { data: null, error }
    }
  }
}
