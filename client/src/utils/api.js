import axios from 'axios';

// Direct connection to Render backend to bypass Vercel proxy issues
// const API_URL = 'https://wanderlist-kdgg.onrender.com';
const API_URL = 'http://localhost:5000'; // Local Development

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
    if (path.startsWith('/uploads')) {
        const filename = path.replace('/uploads/', '');
        return `${API_URL}/api/media/${filename}`;
    }
    return path;
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
