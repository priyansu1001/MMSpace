import { useState } from 'react'
import { Navigate, Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { toast } from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import { Eye, EyeOff, Shield, Lock } from 'lucide-react'
import LoadingSpinner from '../components/LoadingSpinner'

const AdminLoginPage = () => {
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const { login, isAuthenticated, user } = useAuth()
    const navigate = useNavigate()

    const { register, handleSubmit, formState: { errors } } = useForm()

    // Redirect if already authenticated
    if (isAuthenticated) {
        if (user?.role === 'admin') {
            return <Navigate to="/dashboard" replace />
        } else {
            // Non-admin users should be redirected to regular login
            return <Navigate to="/login" replace />
        }
    }

    const onSubmit = async (data) => {
        setLoading(true)
        try {
            console.log('AdminLogin: Starting login process')
            const response = await login(data.email, data.password)

            // Check if the logged-in user is actually an admin
            if (response.user?.role !== 'admin') {
                toast.error('Access denied. Admin credentials required.')
                // You might want to logout the user here
                return
            }

            console.log('AdminLogin: Admin login successful, navigating to dashboard')
            toast.success('Admin login successful!')
            navigate('/dashboard')
        } catch (error) {
            console.error('AdminLogin: Login failed:', error)
            toast.error(error.response?.data?.message || 'Admin login failed')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-red-900/20 to-slate-900 px-4 sm:px-6 lg:px-8 overflow-hidden">
            {/* Background Elements */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-red-500/20 to-pink-600/20 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-orange-500/20 to-red-600/20 rounded-full blur-3xl"></div>
            </div>

            <div className="relative max-w-md w-full max-h-[90vh] overflow-y-auto">
                {/* Admin Login Card */}
                <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl shadow-2xl rounded-3xl border border-white/20 dark:border-slate-700/50 p-6 animate-fadeIn">
                    {/* Header */}
                    <div className="text-center mb-6">
                        <div className="h-16 w-16 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                            <Shield className="h-8 w-8 text-white" />
                        </div>
                        <h2 className="text-3xl font-bold bg-gradient-to-r from-red-600 to-red-500 bg-clip-text text-transparent">
                            Admin Portal
                        </h2>
                        <p className="mt-2 text-slate-600 dark:text-slate-300">
                            Secure access for system administrators
                        </p>
                    </div>

                    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
                        {/* Security Notice */}
                        <div className="bg-red-50/80 dark:bg-red-900/20 backdrop-blur-sm border border-red-200/50 dark:border-red-800/50 rounded-2xl p-4">
                            <div className="flex items-start space-x-3">
                                <div className="h-8 w-8 bg-red-100 dark:bg-red-900/50 rounded-full flex items-center justify-center flex-shrink-0">
                                    <Lock className="h-4 w-4 text-red-600 dark:text-red-400" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-semibold text-red-800 dark:text-red-300">
                                        Restricted Access
                                    </h3>
                                    <p className="mt-1 text-sm text-red-700 dark:text-red-400">
                                        This portal is restricted to authorized administrators only.
                                        Unauthorized access attempts are logged and monitored.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Email Field */}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                Administrator Email
                            </label>
                            <input
                                {...register('email', {
                                    required: 'Email is required',
                                    pattern: {
                                        value: /^\S+@\S+$/i,
                                        message: 'Invalid email address'
                                    }
                                })}
                                type="email"
                                className="w-full bg-white/50 dark:bg-slate-700/50 backdrop-blur-sm border border-white/20 dark:border-slate-600/30 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 text-slate-800 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 transition-all duration-300"
                                placeholder="Enter your admin email"
                            />
                            {errors.email && (
                                <p className="text-sm text-red-500 flex items-center mt-2">
                                    <span className="mr-1">⚠️</span>
                                    {errors.email.message}
                                </p>
                            )}
                        </div>

                        {/* Password Field */}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    {...register('password', { required: 'Password is required' })}
                                    type={showPassword ? 'text' : 'password'}
                                    className="w-full bg-white/50 dark:bg-slate-700/50 backdrop-blur-sm border border-white/20 dark:border-slate-600/30 rounded-2xl px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 text-slate-800 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 transition-all duration-300"
                                    placeholder="Enter your password"
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 pr-4 flex items-center"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-5 w-5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors duration-200" />
                                    ) : (
                                        <Eye className="h-5 w-5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors duration-200" />
                                    )}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="text-sm text-red-500 flex items-center mt-2">
                                    <span className="mr-1">⚠️</span>
                                    {errors.password.message}
                                </p>
                            )}
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white py-3 px-6 rounded-2xl font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transform transition-all duration-300 hover:scale-[1.02] disabled:hover:scale-100 flex items-center justify-center"
                        >
                            {loading ? (
                                <div className="flex items-center">
                                    <LoadingSpinner size="sm" />
                                    <span className="ml-2">Authenticating...</span>
                                </div>
                            ) : (
                                <div className="flex items-center">
                                    <Shield className="h-5 w-5 mr-2" />
                                    Access Admin Portal
                                </div>
                            )}
                        </button>

                        {/* Links */}
                        <div className="text-center space-y-3 pt-3">
                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-slate-300/50 dark:border-slate-600/50"></div>
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-4 bg-white/70 dark:bg-slate-800/70 text-slate-500 dark:text-slate-400">
                                        Regular User?
                                    </span>
                                </div>
                            </div>

                            <Link
                                to="/login"
                                className="inline-flex items-center justify-center w-full py-3 px-6 bg-white/50 dark:bg-slate-700/50 backdrop-blur-sm border border-white/20 dark:border-slate-600/30 rounded-2xl font-medium text-slate-700 dark:text-slate-300 hover:bg-white/80 dark:hover:bg-slate-600/50 transition-all duration-300 hover:scale-[1.02]"
                            >
                                <Shield className="w-4 h-4 mr-2" />
                                Student/Mentor Login
                            </Link>
                        </div>
                    </form>
                </div>

                {/* Footer */}
                <div className="text-center mt-4">
                    <p className="text-xs text-slate-400">
                        🔒 Secure Admin Access • © 2024 MMSpace
                    </p>
                </div>
            </div>
        </div>
    )
}

export default AdminLoginPage