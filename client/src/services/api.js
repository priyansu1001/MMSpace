import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

console.log('API_URL:', API_URL)

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
})

// Add token to requests
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token')
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    (error) => {
        return Promise.reject(error)
    }
)

// Handle token expiration and other errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        console.log('API Error:', error.response?.status, error.response?.data);
        console.log('Request URL:', error.config?.url);
        console.log('Request method:', error.config?.method);

        if (error.response?.status === 401) {
            console.log('Unauthorized access, clearing token and redirecting to login');
            localStorage.removeItem('token');

            // Only redirect if not already on login page and not a login request
            if (!window.location.pathname.includes('/login') && !error.config?.url?.includes('/auth/login')) {
                window.location.href = '/login';
            }
        }

        // Handle network errors
        if (!error.response) {
            console.error('Network error:', error.message);
            console.error('This might be a server connection issue');
            
            // Don't redirect on network errors during login
            if (error.config?.url?.includes('/auth/login')) {
                error.isNetworkError = true;
            }
        }

        // Handle rate limiting
        if (error.response?.status === 429) {
            console.error('Rate limited:', error.response.data);
        }

        return Promise.reject(error);
    }
)

export default api