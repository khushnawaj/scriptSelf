import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import jobService from './jobService';

const initialState = {
    jobs: [],
    job: null,
    isError: false,
    isSuccess: false,
    isLoading: false,
    message: ''
};

export const getJobs = createAsyncThunk('jobs/getAll', async (_, thunkAPI) => {
    try {
        return await jobService.getJobs();
    } catch (error) {
        const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
        return thunkAPI.rejectWithValue(message);
    }
});

export const getJob = createAsyncThunk('jobs/get', async (id, thunkAPI) => {
    try {
        return await jobService.getJob(id);
    } catch (error) {
        const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
        return thunkAPI.rejectWithValue(message);
    }
});

export const jobSlice = createSlice({
    name: 'job',
    initialState,
    reducers: {
        reset: (state) => {
            state.isLoading = false;
            state.isSuccess = false;
            state.isError = false;
            state.message = '';
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(getJobs.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(getJobs.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.jobs = action.payload;
            })
            .addCase(getJobs.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
            })
            .addCase(getJob.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(getJob.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.job = action.payload;
            })
            .addCase(getJob.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
            });
    }
});

export const { reset } = jobSlice.actions;
export default jobSlice.reducer;
