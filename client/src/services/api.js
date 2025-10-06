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
        console.error('=== API ERROR DETAILS ===');
        console.error('Status:', error.response?.status);
        console.error('Data:', error.response?.data);
        console.error('Request URL:', error.config?.url);
        console.error('Request method:', error.config?.method);
        console.error('Request data:', error.config?.data);
        console.error('Request headers:', error.config?.headers);

        if (error.response?.status === 401) {
            console.error('Unauthorized access detected');
            console.error('Error code:', error.response?.data?.code);
            console.error('Current URL:', window.location.pathname);
            
            // Don't clear token immediately for certain operations to prevent cascade
            const isSensitiveOperation = error.config?.url?.includes('/messages') || 
                                       error.config?.url?.includes('/groups');
            
            if (isSensitiveOperation) {
                console.warn('401 error during sensitive operation - not clearing token immediately');
                console.warn('User should manually logout/login if issues persist');
                // Add a flag to the error so components can handle it appropriately
                error.isAuthError = true;
                error.shouldNotClearToken = true;
            } else {
                console.log('Clearing token and redirecting to login');
                localStorage.removeItem('token');

                // Only redirect if not already on login page and not a login request
                if (!window.location.pathname.includes('/login') && !error.config?.url?.includes('/auth/login')) {
                    // Add a small delay to prevent race conditions
                    setTimeout(() => {
                        window.location.href = '/login';
                    }, 100);
                }
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