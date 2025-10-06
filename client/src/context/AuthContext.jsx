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
            
            // Clear any existing token first
            localStorage.removeItem('token')
            
            const response = await api.post('/auth/login', { email, password })
            console.log('Login response received')

            if (!response.data.token) {
                throw new Error('No token received from server')
            }

            // Store token first
            localStorage.setItem('token', response.data.token)
            console.log('Token stored in localStorage')

            // Load full profile with retry mechanism
            let profileResponse
            let retries = 3

            while (retries > 0) {
                try {
                    console.log(`Fetching profile... (attempt ${4 - retries})`)
                    profileResponse = await api.get('/auth/me')
                    console.log('Profile response received')
                    break
                } catch (profileError) {
                    retries--
                    console.error(`Profile fetch failed:`, profileError.response?.data || profileError.message)
                    
                    if (retries === 0) {
                        console.error('All profile fetch attempts failed')
                        throw profileError
                    }
                    
                    console.log(`Retrying profile fetch... (${retries} attempts left)`)
                    await new Promise(resolve => setTimeout(resolve, 1000))
                }
            }

            if (!profileResponse.data.user) {
                throw new Error('No user data received from profile endpoint')
            }

            dispatch({
                type: 'LOGIN_SUCCESS',
                payload: {
                    token: response.data.token,
                    user: profileResponse.data.user,
                    profile: profileResponse.data.profile
                }
            })

            console.log('Login completed successfully for:', profileResponse.data.user.email)
            return response.data
        } catch (error) {
            console.error('Login error:', error)
            console.error('Error response:', error.response?.data)
            
            // Clean up on error
            localStorage.removeItem('token')
            dispatch({ type: 'AUTH_ERROR' })
            
            // Provide more specific error messages
            if (error.response?.status === 401) {
                throw new Error(error.response.data.message || 'Invalid credentials')
            } else if (error.response?.status === 429) {
                throw new Error('Too many login attempts. Please try again later.')
            } else if (error.response?.status >= 500) {
                throw new Error('Server error. Please try again later.')
            } else if (error.code === 'ECONNREFUSED' || !error.response) {
                throw new Error('Cannot connect to server. Please check your connection.')
            } else {
                throw new Error(error.message || 'Login failed. Please try again.')
            }
        }
    }

    const logout = () => {
        console.log('Logging out user')
        localStorage.removeItem('token')
        dispatch({ type: 'LOGOUT' })
    }

    const forceReauth = async () => {
        console.log('Forcing re-authentication due to token issues')
        localStorage.removeItem('token')
        dispatch({ type: 'AUTH_ERROR' })
        
        // Small delay to ensure state is updated
        setTimeout(() => {
            window.location.href = '/login'
        }, 100)
    }

    const value = {
        ...state,
        login,
        logout,
        loadUser,
        forceReauth
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