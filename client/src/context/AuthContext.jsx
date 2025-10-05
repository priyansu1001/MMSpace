import { createContext, useContext, useReducer, useEffect } from 'react'
import api from '../services/api'

const AuthContext = createContext()

const initialState = {
    user: null,
    profile: null,
    token: localStorage.getItem('token'),
    loading: true,
    isAuthenticated: false
}

const authReducer = (state, action) => {
    switch (action.type) {
        case 'LOGIN_SUCCESS':
            localStorage.setItem('token', action.payload.token)
            return {
                ...state,
                user: action.payload.user,
                profile: action.payload.profile,
                token: action.payload.token,
                isAuthenticated: true,
                loading: false
            }
        case 'LOGOUT':
            localStorage.removeItem('token')
            return {
                ...state,
                user: null,
                profile: null,
                token: null,
                isAuthenticated: false,
                loading: false
            }
        case 'LOAD_USER':
            return {
                ...state,
                user: action.payload.user,
                profile: action.payload.profile,
                isAuthenticated: true,
                loading: false
            }
        case 'AUTH_ERROR':
            localStorage.removeItem('token')
            return {
                ...state,
                user: null,
                profile: null,
                token: null,
                isAuthenticated: false,
                loading: false
            }
        default:
            return state
    }
}

export const AuthProvider = ({ children }) => {
    const [state, dispatch] = useReducer(authReducer, initialState)

    // Load user on app start
    useEffect(() => {
        const token = localStorage.getItem('token')
        if (token) {
            loadUser()
        } else {
            dispatch({ type: 'AUTH_ERROR' })
        }
    }, [])

    const loadUser = async () => {
        try {
            const response = await api.get('/auth/me')
            dispatch({
                type: 'LOAD_USER',
                payload: response.data
            })
        } catch (error) {
            dispatch({ type: 'AUTH_ERROR' })
        }
    }

    const login = async (email, password) => {
        try {
            console.log('Attempting login with:', email)
            const response = await api.post('/auth/login', { email, password })
            console.log('Login response:', response.data)

            // Store token first
            localStorage.setItem('token', response.data.token)

            // Load full profile with retry mechanism
            let profileResponse;
            let retries = 3;

            while (retries > 0) {
                try {
                    profileResponse = await api.get('/auth/me')
                    console.log('Profile response:', profileResponse.data)
                    break;
                } catch (profileError) {
                    retries--;
                    if (retries === 0) throw profileError;
                    console.log(`Profile fetch failed, retrying... (${retries} attempts left)`)
                    await new Promise(resolve => setTimeout(resolve, 500));
                }
            }

            dispatch({
                type: 'LOGIN_SUCCESS',
                payload: {
                    token: response.data.token,
                    user: profileResponse.data.user,
                    profile: profileResponse.data.profile
                }
            })

            return response.data
        } catch (error) {
            console.error('Login error:', error)
            console.error('Error response:', error.response?.data)
            // Clean up on error
            localStorage.removeItem('token')
            dispatch({ type: 'AUTH_ERROR' })
            throw error
        }
    }

    const logout = () => {
        console.log('Logging out user');
        // Clear any pending requests
        localStorage.removeItem('token');
        dispatch({ type: 'LOGOUT' });
    }

    const value = {
        ...state,
        login,
        logout,
        loadUser
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}