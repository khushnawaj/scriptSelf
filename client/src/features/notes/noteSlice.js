import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';
import { toast } from 'react-hot-toast';

// Create Note
export const createNote = createAsyncThunk(
  'notes/create',
  async (noteData, thunkAPI) => {
    try {
      const isFormData = noteData instanceof FormData;
      const res = await api.post('/notes', noteData);
      toast.success('Note created!');
      return res.data.data;
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to create note';
      toast.error(message);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Update Note
export const updateNote = createAsyncThunk(
  'notes/update',
  async ({ id, noteData }, thunkAPI) => {
    try {
      const isFormData = noteData instanceof FormData;
      const res = await api.put(`/notes/${id}`, noteData);
      toast.success('Note updated');
      return res.data.data;
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to update note';
      toast.error(message);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get User Notes
export const getNotes = createAsyncThunk(
  'notes/getAll',
  async (_, thunkAPI) => {
    try {
      const res = await api.get('/notes');
      return res.data.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.error);
    }
  }
);

// Delete Note
export const deleteNote = createAsyncThunk(
  'notes/delete',
  async (id, thunkAPI) => {
    try {
      await api.delete(`/notes/${id}`);
      toast.success('Note deleted');
      return id;
    } catch (error) {
      toast.error('Failed to delete note');
      return thunkAPI.rejectWithValue(error.response?.data?.error);
    }
  }
);

// Clone Note (Fork)
export const cloneNote = createAsyncThunk(
  'notes/clone',
  async (id, thunkAPI) => {
    try {
      const res = await api.post(`/notes/${id}/clone`);
      toast.success('Record cloned to your private shelf!');
      return res.data.data;
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to clone record';
      toast.error(message);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get Stats
export const getNoteStats = createAsyncThunk(
  'notes/getStats',
  async (_, thunkAPI) => {
    try {
      const res = await api.get('/notes/stats');
      return res.data.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.error);
    }
  }
);

const initialState = {
  notes: [],
  stats: null,
  isLoading: false,
  isError: false,
  message: '',
};

const noteSlice = createSlice({
  name: 'notes',
  initialState,
  reducers: {
    reset: (state) => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(createNote.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createNote.fulfilled, (state, action) => {
        state.isLoading = false;
        state.notes.push(action.payload);
      })
      .addCase(createNote.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(updateNote.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateNote.fulfilled, (state, action) => {
        state.isLoading = false;
        state.notes = state.notes.map((note) =>
          note._id === action.payload._id ? action.payload : note
        );
      })
      .addCase(updateNote.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(getNotes.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getNotes.fulfilled, (state, action) => {
        state.isLoading = false;
        state.notes = action.payload;
      })
      .addCase(getNotes.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(deleteNote.fulfilled, (state, action) => {
        state.notes = state.notes.filter((note) => note._id !== action.payload);
      })
      .addCase(getNoteStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      })
      .addCase(cloneNote.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(cloneNote.fulfilled, (state, action) => {
        state.isLoading = false;
        state.notes.push(action.payload);
      })
      .addCase(cloneNote.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  },
});

export const { reset: resetNotes } = noteSlice.actions;
export default noteSlice.reducer;
