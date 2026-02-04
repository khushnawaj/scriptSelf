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

// Get User Notes (Optional param for public)
export const getNotes = createAsyncThunk(
  'notes/getAll',
  async (params = {}, thunkAPI) => {
    try {
      const { public: isPublic, search } = params;
      let url = '/notes';
      if (isPublic) url += '?public=true';
      if (search) url += (url.includes('?') ? '&' : '?') + `search=${encodeURIComponent(search)}`;

      const res = await api.get(url);
      return res.data.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.error);
    }
  }
);

// Get Unified Library (User + All Public)
export const getAllNotes = createAsyncThunk(
  'notes/getUnified',
  async (_, thunkAPI) => {
    try {
      const [userRes, publicRes] = await Promise.all([
        api.get('/notes'),
        api.get('/notes?public=true')
      ]);

      // Merge and deduplicate
      const userNotes = userRes.data.data;
      const publicNotes = publicRes.data.data;

      const merged = [...userNotes];
      publicNotes.forEach(pn => {
        if (!merged.find(un => un._id === pn._id)) {
          merged.push(pn);
        }
      });

      return merged;
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

// Add Comment
export const addComment = createAsyncThunk(
  'notes/addComment',
  async ({ id, text }, thunkAPI) => {
    try {
      const res = await api.post(`/notes/${id}/comments`, { text });
      toast.success('Response posted');
      return { id, comments: res.data.data };
    } catch (error) {
      toast.error('Failed to post comment');
      return thunkAPI.rejectWithValue(error.response?.data?.error);
    }
  }
);

// Delete Comment
export const deleteComment = createAsyncThunk(
  'notes/deleteComment',
  async ({ noteId, commentId }, thunkAPI) => {
    try {
      const res = await api.delete(`/notes/${noteId}/comments/${commentId}`);
      toast.success('Comment deleted');
      return { id: noteId, comments: res.data.data };
    } catch (error) {
      toast.error('Failed to delete comment');
      return thunkAPI.rejectWithValue(error.response?.data?.error);
    }
  }
);

// Update Comment
export const updateComment = createAsyncThunk(
  'notes/updateComment',
  async ({ noteId, commentId, text }, thunkAPI) => {
    try {
      const res = await api.put(`/notes/${noteId}/comments/${commentId}`, { text });
      toast.success('Comment updated');
      return { id: noteId, comments: res.data.data };
    } catch (error) {
      toast.error('Failed to update comment');
      return thunkAPI.rejectWithValue(error.response?.data?.error);
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
      })
      .addCase(addComment.fulfilled, (state, action) => {
        const { id, comments } = action.payload;
        const noteIndex = state.notes.findIndex((n) => n._id === id);
        if (noteIndex !== -1) {
          state.notes[noteIndex].comments = comments;
        }
      })
      .addCase(deleteComment.fulfilled, (state, action) => {
        const { id, comments } = action.payload;
        const noteIndex = state.notes.findIndex((n) => n._id === id);
        if (noteIndex !== -1) {
          state.notes[noteIndex].comments = comments;
        }
      })
      .addCase(updateComment.fulfilled, (state, action) => {
        const { id, comments } = action.payload;
        const noteIndex = state.notes.findIndex((n) => n._id === id);
        if (noteIndex !== -1) {
          state.notes[noteIndex].comments = comments;
        }
      })
      .addCase(getAllNotes.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getAllNotes.fulfilled, (state, action) => {
        state.isLoading = false;
        state.notes = action.payload;
      })
      .addCase(getAllNotes.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  },
});

export const { reset: resetNotes } = noteSlice.actions;
export default noteSlice.reducer;
