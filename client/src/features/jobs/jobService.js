import axios from 'axios';

const API_URL = '/api/v1/jobs/';

// Get all jobs
const getJobs = async () => {
    const response = await axios.get(API_URL);
    return response.data.data || [];
};

// Get single job
const getJob = async (id) => {
    const response = await axios.get(API_URL + id);
    return response.data.data || response.data;
};

const jobService = {
    getJobs,
    getJob
};

export default jobService;
