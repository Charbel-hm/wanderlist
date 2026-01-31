import axios from 'axios';

const API_URL = import.meta.env.MODE === 'production'
    ? 'https://wanderlist-kdgg.onrender.com'
    : 'http://localhost:5000';

const api = axios.create({
    baseURL: `${API_URL}/api`,
    timeout: 10000, // 10 seconds timeout
    headers: {
        'Content-Type': 'application/json'
    }
});

export const getMediaUrl = (path) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;

    // Clean path if it contains /uploads/
    const filename = path.replace('/uploads/', '').replace('uploads/', '');

    // Assume it's a media file served by API
    return `${API_URL}/api/media/${filename}`;
};

// Add a request interceptor to include the auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['x-auth-token'] = token;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export default api;
