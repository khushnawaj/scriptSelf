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

// Update Details
export const updateUserDetails = createAsyncThunk(
  'auth/updateDetails',
  async (userData, thunkAPI) => {
    try {
      // Check if userData is FormData
      const isFormData = userData instanceof FormData;

      const res = await api.put('/auth/updatedetails', userData, {
        headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {}
      });
      toast.success('Profile updated successfully!');
      return res.data.data;
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to update user';
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
      // Update User Details
      .addCase(updateUserDetails.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateUserDetails.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isError = false; // Clear any previous error
        state.message = ''; // Clear any previous message
      })
      .addCase(updateUserDetails.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  },
});

export const { reset } = authSlice.actions;
export default authSlice.reducer;
