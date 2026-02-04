import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';
import { toast } from 'react-hot-toast';

// Async Thunks
export const register = createAsyncThunk(
  'auth/register',
  async (userData, thunkAPI) => {
    try {
      await api.post('/auth/register', userData);
      // After register, we can either automatically login or ask user to login. 
      // Based on previous context, we want to auto-login.
      // Let's fetch the user immediately.
      const userRes = await api.get('/auth/me');
      toast.success('Registration successful!');
      return userRes.data.data;
    } catch (error) {
      const message = error.response?.data?.error || 'Registration failed';
      toast.error(message);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const login = createAsyncThunk(
  'auth/login',
  async (userData, thunkAPI) => {
    try {
      await api.post('/auth/login', userData);
      const userRes = await api.get('/auth/me');
      toast.success('Logged in successfully');
      return userRes.data.data;
    } catch (error) {
      const message = error.response?.data?.error || 'Login failed';
      toast.error(message);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Update Profile
export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (userData, thunkAPI) => {
    try {
      // Check if userData is FormData
      const isFormData = userData instanceof FormData;

      const res = await api.put('/auth/updatedetails', userData, {
        headers: isFormData ? { 'Content-Type': undefined } : undefined
      });
      toast.success('Profile updated successfully!');
      return res.data.data;
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to update profile';
      toast.error(message);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const logout = createAsyncThunk(
  'auth/logout',
  async (_, thunkAPI) => {
    try {
      await api.get('/auth/logout');
      toast.success('Logged out');
    } catch (error) {
      console.error(error);
    }
  }
);



// Follow User
export const followUser = createAsyncThunk(
  'auth/followUser',
  async (userId, thunkAPI) => {
    try {
      await api.post(`/users/${userId}/follow`);
      toast.success('Following user');
      return userId;
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to follow user');
      return thunkAPI.rejectWithValue(error.response?.data?.error);
    }
  }
);

// Unfollow User
export const unfollowUser = createAsyncThunk(
  'auth/unfollowUser',
  async (userId, thunkAPI) => {
    try {
      await api.delete(`/users/${userId}/follow`);
      toast.success('Unfollowed user');
      return userId;
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to unfollow user');
      return thunkAPI.rejectWithValue(error.response?.data?.error);
    }
  }
);

// Forgot Password
export const forgotPassword = createAsyncThunk(
  'auth/forgotPassword',
  async (email, thunkAPI) => {
    try {
      const res = await api.post('/auth/forgotpassword', { email });
      toast.success(res.data.data);
      return res.data.data;
    } catch (error) {
      const message = error.response?.data?.error || 'Something went wrong';
      toast.error(message);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Reset Password
export const resetPassword = createAsyncThunk(
  'auth/resetPassword',
  async ({ resetToken, password }, thunkAPI) => {
    try {
      const res = await api.put(`/auth/resetpassword/${resetToken}`, { password });
      return res.data;
    } catch (error) {
      const message = error.response?.data?.error || 'Reset failed';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Update Arcade Stats
export const updateArcadeStats = createAsyncThunk(
  'auth/updateArcadeStats',
  async (payload, thunkAPI) => {
    try {
      const data = typeof payload === 'number' ? { points: payload } : payload;
      const res = await api.put('/users/arcade', data);
      return res.data.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.error);
    }
  }
);

export const loadUser = createAsyncThunk(
  'auth/loadUser',
  async (_, thunkAPI) => {
    try {
      const res = await api.get('/auth/me');
      return res.data.data;
    } catch (error) {
      // If 401, standard behavior, just return null
      return thunkAPI.rejectWithValue('Not authorized');
    }
  }
);

const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: true, // Start true to check auth on mount
  isError: false,
  message: '',
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    reset: (state) => {
      state.isError = false;
      state.message = '';
    },
  },
  extraReducers: (builder) => {
    builder
      // Register
      .addCase(register.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload;
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
        state.user = null;
      })
      // Login
      .addCase(login.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
        state.user = null;
      })
      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
      })
      // Load User
      .addCase(loadUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(loadUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload;
      })
      .addCase(loadUser.rejected, (state) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
      })
      // Update Profile
      .addCase(updateProfile.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isError = false;
        state.message = '';
      })

      .addCase(updateProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(followUser.fulfilled, (state, action) => {
        if (state.user) {
          state.user.following.push(action.payload);
        }
      })
      .addCase(unfollowUser.fulfilled, (state, action) => {
        if (state.user) {
          state.user.following = state.user.following.filter(id => id !== action.payload);
        }
      });

    // Forgot & Reset Password local states can be handled by component or here.
    // We mainly care about resetPassword succeeding to stop loading.
    builder
      .addCase(forgotPassword.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
      })
      .addCase(forgotPassword.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(resetPassword.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.isLoading = false;
        state.isError = false;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(updateArcadeStats.fulfilled, (state, action) => {
        if (state.user) {
          state.user.arcade = action.payload;
        }
      });

  },
});

export const { reset } = authSlice.actions;
export default authSlice.reducer;
