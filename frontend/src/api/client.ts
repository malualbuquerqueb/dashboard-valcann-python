import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 60000,
  withCredentials: true, 
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const message = error.response?.data?.error || error.message;
    if (status === 401) {
      window.location.reload();
    }
    console.error(`[API Error] ${status}: ${message}`);
    return Promise.reject(error);
  }
);

export default apiClient;
