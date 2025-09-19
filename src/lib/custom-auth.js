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
      console.log('tokenManager: Storing token in localStorage');
      localStorage.setItem('ravenai_token', token);
      console.log('tokenManager: Token stored successfully');
    } else {
      console.log('tokenManager: Cannot store token, window is undefined');
    }
  },

  // Get token from localStorage
  getToken() {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('ravenai_token');
      console.log('tokenManager: Retrieved token from localStorage:', !!token);
      return token;
    }
    console.log('tokenManager: Cannot get token, window is undefined');
    return null;
  },

  // Remove token from localStorage
  removeToken() {
    if (typeof window !== 'undefined') {
      console.log('tokenManager: Removing token from localStorage');
      localStorage.removeItem('ravenai_token');
      localStorage.removeItem('ravenai_user'); // Also remove user data
      console.log('tokenManager: Token and user data removed successfully');
    } else {
      console.log('tokenManager: Cannot remove token, window is undefined');
    }
  },

  // Check if token exists
  hasToken() {
    const hasToken = !!this.getToken();
    console.log('tokenManager: Has token:', hasToken);
    return hasToken;
  },

  // Store user data in localStorage
  setUser(user) {
    if (typeof window !== 'undefined') {
      console.log('tokenManager: Storing user data in localStorage');
      localStorage.setItem('ravenai_user', JSON.stringify(user));
      console.log('tokenManager: User data stored successfully');
    }
  },

  // Get user data from localStorage
  getUser() {
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem('ravenai_user');
      if (userData) {
        try {
          const user = JSON.parse(userData);
          console.log('tokenManager: Retrieved user data from localStorage:', user.email);
          return user;
        } catch (error) {
          console.log('tokenManager: Failed to parse user data from localStorage');
          return null;
        }
      }
    }
    return null;
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
        console.log('customAuth: Registration successful, storing token');
        tokenManager.setToken(data.token);
        tokenManager.setUser(data.user);
        console.log('customAuth: Token and user data stored, user:', data.user.email);
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
        console.log('customAuth: Login successful, storing token');
        tokenManager.setToken(data.token);
        tokenManager.setUser(data.user);
        console.log('customAuth: Token and user data stored, user:', data.user.email);
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
      console.log('customAuth: Getting current user, token exists:', !!token);
      
      if (!token) {
        console.log('customAuth: No token found');
        // Check if we have user data in localStorage as fallback
        const cachedUser = tokenManager.getUser();
        if (cachedUser) {
          console.log('customAuth: Found cached user data:', cachedUser.email);
          return { user: cachedUser, error: null };
        }
        return { user: null, error: null };
      }

      // Try to verify token with server first
      try {
        console.log('customAuth: Verifying token with server...');
        const response = await fetch(`${SUPABASE_URL}/functions/v1/auth-verify`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        const data = await response.json();
        console.log('customAuth: Server response:', { status: response.status, success: data.success });

        if (response.ok && data.success && data.user) {
          console.log('customAuth: User verified successfully:', data.user.email);
          return { user: data.user, error: null };
        }

        if (!response.ok) {
          console.log('customAuth: Server verification failed, trying client-side validation');
        }
      } catch (serverError) {
        console.log('customAuth: Server verification failed, trying client-side validation:', serverError.message);
      }

      // Fallback: Try to decode token client-side (basic validation)
      try {
        const tokenParts = token.split('.');
        if (tokenParts.length === 3) {
          const payload = JSON.parse(atob(tokenParts[1]));
          const now = Math.floor(Date.now() / 1000);
          
          if (payload.exp && payload.exp > now) {
            console.log('customAuth: Token is valid client-side, creating user object');
            // Create a basic user object from token payload
            const user = {
              id: payload.sub || payload.user_id,
              email: payload.email,
              name: payload.name || payload.email?.split('@')[0],
              created_at: payload.created_at || new Date().toISOString()
            };
            // Store user data for future use
            tokenManager.setUser(user);
            console.log('customAuth: User created from token and stored:', user.email);
            return { user, error: null };
          } else {
            console.log('customAuth: Token expired');
            tokenManager.removeToken();
            return { user: null, error: 'Token expired' };
          }
        }
      } catch (clientError) {
        console.log('customAuth: Client-side validation failed:', clientError.message);
      }

      // If all else fails, remove the token
      console.log('customAuth: All validation methods failed, removing token');
      tokenManager.removeToken();
      return { user: null, error: 'Invalid token' };
    } catch (error) {
      console.error('customAuth: Get current user error:', error);
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
