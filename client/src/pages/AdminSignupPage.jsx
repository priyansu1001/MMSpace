import { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { toast } from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import { Eye, EyeOff, Shield, UserPlus, Lock } from 'lucide-react'
import LoadingSpinner from '../components/LoadingSpinner'
import api from '../services/api'

const AdminSignupPage = () => {
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const { user, isAuthenticated } = useAuth()

    const { register, handleSubmit, formState: { errors } } = useForm()

    // Only allow access to existing admins
    if (!isAuthenticated || user?.role !== 'admin') {
        return <Navigate to="/admin/login" replace />
    }

    const onSubmit = async (data) => {
        setLoading(true)
        try {
            const response = await api.post('/auth/register', {
                ...data,
                role: 'admin'
            })
            toast.success('Admin account created successfully!')
            // Reset form
            document.querySelector('form').reset()
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to create admin account')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-red-900/20 to-slate-900 px-4 sm:px-6 lg:px-8 overflow-hidden">
            {/* Background Elements */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-red-500/20 to-orange-600/20 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-pink-500/20 to-red-600/20 rounded-full blur-3xl"></div>
            </div>

            <div className="relative max-w-lg w-full max-h-[90vh] overflow-y-auto">
                {/* Admin Signup Card */}
                <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl shadow-2xl rounded-3xl border border-white/20 dark:border-slate-700/50 p-6 animate-fadeIn my-4">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="h-16 w-16 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                            <UserPlus className="h-8 w-8 text-white" />
                        </div>
                        <h2 className="text-3xl font-bold bg-gradient-to-r from-red-600 to-red-500 bg-clip-text text-transparent">
                            Create Admin Account
                        </h2>
                        <p className="mt-2 text-slate-600 dark:text-slate-300">
                            Add a new system administrator
                        </p>
                    </div>
                    <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                        {/* Security Notice */}
                        <div className="bg-red-50/80 dark:bg-red-900/20 backdrop-blur-sm border border-red-200/50 dark:border-red-800/50 rounded-2xl p-4">
                            <div className="flex items-start space-x-3">
                                <div className="h-8 w-8 bg-red-100 dark:bg-red-900/50 rounded-full flex items-center justify-center flex-shrink-0">
                                    <Lock className="h-4 w-4 text-red-600 dark:text-red-400" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-semibold text-red-800 dark:text-red-300">
                                        Administrator Access
                                    </h3>
                                    <p className="mt-1 text-sm text-red-700 dark:text-red-400">
                                        You are creating an account with full administrative privileges.
                                        Ensure this person is authorized for system administration.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Basic Information */}
                        <div className="grid grid-cols-1 gap-4">
                            {/* Full Name */}
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                    Full Name
                                </label>
                                <input
                                    {...register('fullName', { required: 'Full name is required' })}
                                    type="text"
                                    className="w-full bg-white/50 dark:bg-slate-700/50 backdrop-blur-sm border border-white/20 dark:border-slate-600/30 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 text-slate-800 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 transition-all duration-300"
                                    placeholder="Enter full name"
                                />
                                {errors.fullName && (
                                    <p className="text-sm text-red-500 flex items-center mt-1">
                                        <span className="mr-1">⚠️</span>
                                        {errors.fullName.message}
                                    </p>
                                )}
                            </div>

                            {/* Email */}
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
                                    className="w-full bg-white/50 dark:bg-slate-700/50 backdrop-blur-sm border border-white/20 dark:border-slate-600/30 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 text-slate-800 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 transition-all duration-300"
                                    placeholder="Enter email address"
                                />
                                {errors.email && (
                                    <p className="text-sm text-red-500 flex items-center mt-1">
                                        <span className="mr-1">⚠️</span>
                                        {errors.email.message}
                                    </p>
                                )}
                            </div>

                            {/* Password */}
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                    Password
                                </label>
                                <div className="relative">
                                    <input
                                        {...register('password', {
                                            required: 'Password is required',
                                            minLength: {
                                                value: 6,
                                                message: 'Password must be at least 6 characters'
                                            }
                                        })}
                                        type={showPassword ? 'text' : 'password'}
                                        className="w-full bg-white/50 dark:bg-slate-700/50 backdrop-blur-sm border border-white/20 dark:border-slate-600/30 rounded-2xl px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 text-slate-800 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 transition-all duration-300"
                                        placeholder="Create a password"
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
                                    <p className="text-sm text-red-500 flex items-center mt-1">
                                        <span className="mr-1">⚠️</span>
                                        {errors.password.message}
                                    </p>
                                )}
                            </div>

                            {/* Phone */}
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                    Phone Number
                                </label>
                                <input
                                    {...register('phone', { required: 'Phone number is required' })}
                                    type="tel"
                                    className="w-full bg-white/50 dark:bg-slate-700/50 backdrop-blur-sm border border-white/20 dark:border-slate-600/30 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 text-slate-800 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 transition-all duration-300"
                                    placeholder="Enter phone number"
                                />
                                {errors.phone && (
                                    <p className="text-sm text-red-500 flex items-center mt-1">
                                        <span className="mr-1">⚠️</span>
                                        {errors.phone.message}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Admin Information */}
                        <div className="space-y-4 p-4 bg-red-50/50 dark:bg-red-900/20 rounded-2xl border border-red-200/50 dark:border-red-800/50">
                            <h3 className="text-sm font-semibold text-red-800 dark:text-red-300">Administrative Details</h3>
                            <div className="grid grid-cols-1 gap-4">
                                {/* Department */}
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                        Department
                                    </label>
                                    <input
                                        {...register('department')}
                                        type="text"
                                        className="w-full bg-white/50 dark:bg-slate-700/50 backdrop-blur-sm border border-white/20 dark:border-slate-600/30 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500/50 text-slate-800 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 transition-all duration-300"
                                        placeholder="e.g., Administration"
                                        defaultValue="Administration"
                                    />
                                </div>

                                {/* Position */}
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                        Position
                                    </label>
                                    <input
                                        {...register('position')}
                                        type="text"
                                        className="w-full bg-white/50 dark:bg-slate-700/50 backdrop-blur-sm border border-white/20 dark:border-slate-600/30 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500/50 text-slate-800 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 transition-all duration-300"
                                        placeholder="e.g., System Administrator"
                                        defaultValue="System Administrator"
                                    />
                                </div>

                                {/* Employee ID */}
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                        Employee ID (Optional)
                                    </label>
                                    <input
                                        {...register('employeeId')}
                                        type="text"
                                        className="w-full bg-white/50 dark:bg-slate-700/50 backdrop-blur-sm border border-white/20 dark:border-slate-600/30 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500/50 text-slate-800 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 transition-all duration-300"
                                        placeholder="Leave blank for auto-generation"
                                    />
                                </div>
                            </div>
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
                                    <span className="ml-2">Creating Account...</span>
                                </div>
                            ) : (
                                <div className="flex items-center">
                                    <UserPlus className="h-5 w-5 mr-2" />
                                    Create Admin Account
                                </div>
                            )}
                        </button>

                        {/* Links */}
                        <div className="text-center space-y-4 pt-4">
                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-slate-300/50 dark:border-slate-600/50"></div>
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-4 bg-white/70 dark:bg-slate-800/70 text-slate-500 dark:text-slate-400">
                                        Done creating accounts?
                                    </span>
                                </div>
                            </div>

                            <Link
                                to="/dashboard"
                                className="inline-flex items-center justify-center w-full py-3 px-6 bg-white/50 dark:bg-slate-700/50 backdrop-blur-sm border border-white/20 dark:border-slate-600/30 rounded-2xl font-medium text-slate-700 dark:text-slate-300 hover:bg-white/80 dark:hover:bg-slate-600/50 transition-all duration-300 hover:scale-[1.02]"
                            >
                                ← Back to Dashboard
                            </Link>
                        </div>
                    </form>
                </div>

                {/* Footer */}
                <div className="text-center mt-8">
                    <p className="text-sm text-slate-400">
                        🔒 Secure Admin Creation • © 2024 Mentor-Mentee Platform
                    </p>
                </div>
            </div>
        </div>
    )
}

export default AdminSignupPage