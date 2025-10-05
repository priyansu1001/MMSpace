import { useState } from 'react'
import { Navigate, Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { toast } from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import { Eye, EyeOff, Shield } from 'lucide-react'
import LoadingSpinner from '../components/LoadingSpinner'

const LoginPage = () => {
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const { login, isAuthenticated } = useAuth()
    const navigate = useNavigate()

    const { register, handleSubmit, formState: { errors } } = useForm()

    if (isAuthenticated) {
        return <Navigate to="/dashboard" replace />
    }

    const onSubmit = async (data) => {
        setLoading(true)
        try {
            console.log('LoginPage: Starting login process')
            await login(data.email, data.password)
            console.log('LoginPage: Login completed, navigating to dashboard')
            toast.success('Login successful!')
            navigate('/dashboard')
        } catch (error) {
            console.error('LoginPage: Login failed:', error)
            toast.error(error.response?.data?.message || 'Login failed')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 px-4 sm:px-6 lg:px-8 overflow-hidden">
            {/* Background Elements */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-indigo-600/20 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-purple-400/20 to-pink-600/20 rounded-full blur-3xl"></div>
            </div>

            <div className="relative max-w-md w-full max-h-[90vh] overflow-y-auto">
                {/* Login Card */}
                <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl shadow-2xl rounded-3xl border border-white/20 dark:border-slate-700/50 p-6 animate-fadeIn">
                    {/* Header */}
                    <div className="text-center mb-6">
                        <div className="h-16 w-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                            <Shield className="w-8 h-8 text-white" />
                        </div>
                        <h2 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 dark:from-white dark:to-slate-200 bg-clip-text text-transparent">
                            Welcome Back
                        </h2>
                        <p className="mt-2 text-slate-600 dark:text-slate-300">
                            Mentor-Mentee Management System
                        </p>
                    </div>

                    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
                        {/* Email Field */}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                Email Address
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
                                className="w-full bg-white/50 dark:bg-slate-700/50 backdrop-blur-sm border border-white/20 dark:border-slate-600/30 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-slate-800 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 transition-all duration-300"
                                placeholder="Enter your email"
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
                                    className="w-full bg-white/50 dark:bg-slate-700/50 backdrop-blur-sm border border-white/20 dark:border-slate-600/30 rounded-2xl px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-slate-800 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 transition-all duration-300"
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

                        {/* Login Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 px-6 rounded-2xl font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transform transition-all duration-300 hover:scale-[1.02] disabled:hover:scale-100"
                        >
                            {loading ? (
                                <div className="flex items-center justify-center">
                                    <LoadingSpinner size="sm" />
                                    <span className="ml-2">Signing in...</span>
                                </div>
                            ) : (
                                'Sign In'
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
                                        New here?
                                    </span>
                                </div>
                            </div>

                            <Link
                                to="/signup"
                                className="inline-flex items-center justify-center w-full py-3 px-6 bg-white/50 dark:bg-slate-700/50 backdrop-blur-sm border border-white/20 dark:border-slate-600/30 rounded-2xl font-medium text-slate-700 dark:text-slate-300 hover:bg-white/80 dark:hover:bg-slate-600/50 transition-all duration-300 hover:scale-[1.02]"
                            >
                                Create Account
                            </Link>

                            <Link
                                to="/admin/login"
                                className="inline-flex items-center justify-center text-sm font-medium text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors duration-200"
                            >
                                <Shield className="w-4 h-4 mr-1" />
                                Administrator Portal
                            </Link>
                        </div>
                    </form>
                </div>

                {/* Footer */}
                <div className="text-center mt-4">
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                        © 2024 MMSpace. All rights reserved.
                    </p>
                </div>
            </div>
        </div>
    )
}

export default LoginPage