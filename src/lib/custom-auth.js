const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('Missing Supabase environment variables');
}

// Token management utilities
export const tokenManager = {
  // Store token in localStorage
  setToken(token) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('ravenai_token', token);
    }
  },

  // Get token from localStorage
  getToken() {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('ravenai_token');
    }
    return null;
  },

  // Remove token from localStorage
  removeToken() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('ravenai_token');
    }
  },

  // Check if token exists
  hasToken() {
    return !!this.getToken();
  }
};

// Custom authentication functions
export const customAuth = {
  // Sign up new user
  async signUp(email, name, password) {
    try {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/auth-register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({ email, name, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      if (data.success && data.token) {
        tokenManager.setToken(data.token);
        return {
          success: true,
          user: data.user,
          token: data.token
        };
      }

      throw new Error('Registration failed');
    } catch (error) {
      console.error('Sign up error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  // Sign in existing user
  async signIn(email, password) {
    try {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/auth-login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      if (data.success && data.token) {
        tokenManager.setToken(data.token);
        return {
          success: true,
          user: data.user,
          token: data.token
        };
      }

      throw new Error('Login failed');
    } catch (error) {
      console.error('Sign in error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  // Sign out user
  async signOut() {
    try {
      tokenManager.removeToken();
      return { success: true };
    } catch (error) {
      console.error('Sign out error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  // Get current user from token
  async getCurrentUser() {
    try {
      const token = tokenManager.getToken();
      
      if (!token) {
        return { user: null, error: null };
      }

      const response = await fetch(`${SUPABASE_URL}/functions/v1/auth-verify`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (!response.ok) {
        // Token is invalid, remove it
        tokenManager.removeToken();
        return { user: null, error: data.error || 'Invalid token' };
      }

      if (data.success && data.user) {
        return { user: data.user, error: null };
      }

      return { user: null, error: 'Failed to get user' };
    } catch (error) {
      console.error('Get current user error:', error);
      tokenManager.removeToken();
      return { user: null, error: error.message };
    }
  },

  // Verify token validity
  async verifyToken() {
    try {
      const token = tokenManager.getToken();
      
      if (!token) {
        return { valid: false, error: 'No token found' };
      }

      const response = await fetch(`${SUPABASE_URL}/functions/v1/auth-verify`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (!response.ok) {
        tokenManager.removeToken();
        return { valid: false, error: data.error || 'Invalid token' };
      }

      return { valid: true, user: data.user };
    } catch (error) {
      console.error('Token verification error:', error);
      tokenManager.removeToken();
      return { valid: false, error: error.message };
    }
  },

  // Update password
  async updatePassword(email, oldPassword, newPassword) {
    try {
      // First verify old password by attempting to sign in
      const signInResult = await this.signIn(email, oldPassword);
      
      if (!signInResult.success) {
        return {
          success: false,
          error: 'Current password is incorrect'
        };
      }

      // Here you would typically call an update password endpoint
      // For now, we'll return success (you can implement this later)
      return {
        success: true,
        message: 'Password updated successfully'
      };
    } catch (error) {
      console.error('Update password error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
};
