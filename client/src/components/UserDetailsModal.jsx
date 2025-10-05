import { useState, useEffect } from 'react'
import { X, User, Mail, Phone, MapPin, Calendar, Save, Edit3, GraduationCap, Shield, Heart, Users } from 'lucide-react'
import api from '../services/api'
import LoadingSpinner from './LoadingSpinner'
import { toast } from 'react-hot-toast'

const UserDetailsModal = ({ user, isOpen, onClose, onUpdate }) => {
    const [userDetails, setUserDetails] = useState(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [editMode, setEditMode] = useState(false)
    const [formData, setFormData] = useState({})

    useEffect(() => {
        if (isOpen && user) {
            fetchUserDetails()
        }
    }, [isOpen, user])

    const fetchUserDetails = async () => {
        try {
            setLoading(true)
            const response = await api.get(`/admin/users/${user._id}/details`)
            setUserDetails(response.data)
            setFormData(response.data)
        } catch (error) {
            console.error('Error fetching user details:', error)
            toast.error('Failed to fetch user details')
        } finally {
            setLoading(false)
        }
    }

    const handleSave = async () => {
        try {
            setSaving(true)
            const response = await api.put(`/admin/users/${user._id}/details`, formData)
            setUserDetails(response.data)
            setEditMode(false)
            toast.success('User details updated successfully')
            onUpdate && onUpdate(response.data)
        } catch (error) {
            console.error('Error updating user details:', error)
            toast.error('Failed to update user details')
        } finally {
            setSaving(false)
        }
    }

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }))
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
            <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 dark:border-slate-700/50 w-full max-w-4xl max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="p-6 border-b border-white/20 dark:border-slate-700/50">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div className={`h-16 w-16 rounded-2xl flex items-center justify-center shadow-lg ${user?.role === 'admin' ? 'bg-gradient-to-br from-red-500 to-red-600' :
                                    user?.role === 'mentor' ? 'bg-gradient-to-br from-blue-500 to-indigo-600' :
                                        'bg-gradient-to-br from-green-500 to-emerald-600'
                                }`}>
                                {user?.role === 'admin' ? <Shield className="h-8 w-8 text-white" /> :
                                    user?.role === 'mentor' ? <User className="h-8 w-8 text-white" /> :
                                        <GraduationCap className="h-8 w-8 text-white" />}
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
                                    {userDetails?.fullName || user?.email}
                                </h2>
                                <p className="text-slate-600 dark:text-slate-400 capitalize">
                                    {user?.role} Details
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2">
                            {!editMode ? (
                                <button
                                    onClick={() => setEditMode(true)}
                                    className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors duration-200"
                                >
                                    <Edit3 className="h-5 w-5" />
                                </button>
                            ) : (
                                <button
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="p-2 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors duration-200 disabled:opacity-50"
                                >
                                    {saving ? <LoadingSpinner size="sm" /> : <Save className="h-5 w-5" />}
                                </button>
                            )}
                            <button
                                onClick={onClose}
                                className="p-2 rounded-full hover:bg-slate-100/50 dark:hover:bg-slate-700/50 transition-colors duration-200"
                            >
                                <X className="h-6 w-6 text-slate-600 dark:text-slate-400" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                    {loading ? (
                        <div className="flex items-center justify-center h-64">
                            <LoadingSpinner />
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* Basic Information */}
                            <div className="bg-white/50 dark:bg-slate-700/50 backdrop-blur-sm rounded-2xl p-6">
                                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center">
                                    <User className="h-5 w-5 mr-2" />
                                    Basic Information
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                            Full Name
                                        </label>
                                        {editMode ? (
                                            <input
                                                type="text"
                                                value={formData.fullName || ''}
                                                onChange={(e) => handleInputChange('fullName', e.target.value)}
                                                className="w-full bg-white/50 dark:bg-slate-600/50 border border-white/20 dark:border-slate-500/30 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-slate-800 dark:text-white"
                                            />
                                        ) : (
                                            <p className="text-slate-800 dark:text-white font-medium">
                                                {userDetails?.fullName || 'Not provided'}
                                            </p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                            Email
                                        </label>
                                        <p className="text-slate-800 dark:text-white font-medium">
                                            {userDetails?.userId?.email || user?.email}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                            Phone
                                        </label>
                                        {editMode ? (
                                            <input
                                                type="tel"
                                                value={formData.phone || ''}
                                                onChange={(e) => handleInputChange('phone', e.target.value)}
                                                className="w-full bg-white/50 dark:bg-slate-600/50 border border-white/20 dark:border-slate-500/30 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-slate-800 dark:text-white"
                                            />
                                        ) : (
                                            <p className="text-slate-800 dark:text-white font-medium">
                                                {userDetails?.phone || 'Not provided'}
                                            </p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                            Date of Birth
                                        </label>
                                        {editMode ? (
                                            <input
                                                type="date"
                                                value={formData.dateOfBirth ? formData.dateOfBirth.split('T')[0] : ''}
                                                onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                                                className="w-full bg-white/50 dark:bg-slate-600/50 border border-white/20 dark:border-slate-500/30 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-slate-800 dark:text-white"
                                            />
                                        ) : (
                                            <p className="text-slate-800 dark:text-white font-medium">
                                                {userDetails?.dateOfBirth
                                                    ? new Date(userDetails.dateOfBirth).toLocaleDateString()
                                                    : 'Not provided'
                                                }
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <div className="mt-4">
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                        Address
                                    </label>
                                    {editMode ? (
                                        <textarea
                                            value={formData.address || ''}
                                            onChange={(e) => handleInputChange('address', e.target.value)}
                                            rows="3"
                                            className="w-full bg-white/50 dark:bg-slate-600/50 border border-white/20 dark:border-slate-500/30 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-slate-800 dark:text-white resize-none"
                                        />
                                    ) : (
                                        <p className="text-slate-800 dark:text-white font-medium">
                                            {userDetails?.address || 'Not provided'}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Role-specific Information */}
                            {user?.role === 'mentor' && (
                                <div className="bg-white/50 dark:bg-slate-700/50 backdrop-blur-sm rounded-2xl p-6">
                                    <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center">
                                        <Shield className="h-5 w-5 mr-2" />
                                        Mentor Information
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                                Department
                                            </label>
                                            {editMode ? (
                                                <input
                                                    type="text"
                                                    value={formData.department || ''}
                                                    onChange={(e) => handleInputChange('department', e.target.value)}
                                                    className="w-full bg-white/50 dark:bg-slate-600/50 border border-white/20 dark:border-slate-500/30 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-slate-800 dark:text-white"
                                                />
                                            ) : (
                                                <p className="text-slate-800 dark:text-white font-medium">
                                                    {userDetails?.department || 'Not provided'}
                                                </p>
                                            )}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                                Employee ID
                                            </label>
                                            <p className="text-slate-800 dark:text-white font-medium">
                                                {userDetails?.employeeId || 'Auto-generated'}
                                            </p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                                Courses
                                            </label>
                                            {editMode ? (
                                                <input
                                                    type="text"
                                                    value={formData.courses || ''}
                                                    onChange={(e) => handleInputChange('courses', e.target.value)}
                                                    placeholder="e.g., Mathematics, Physics"
                                                    className="w-full bg-white/50 dark:bg-slate-600/50 border border-white/20 dark:border-slate-500/30 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-slate-800 dark:text-white"
                                                />
                                            ) : (
                                                <p className="text-slate-800 dark:text-white font-medium">
                                                    {userDetails?.courses || 'Not specified'}
                                                </p>
                                            )}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                                Classes Assigned
                                            </label>
                                            {editMode ? (
                                                <input
                                                    type="text"
                                                    value={formData.classesAssigned || ''}
                                                    onChange={(e) => handleInputChange('classesAssigned', e.target.value)}
                                                    placeholder="e.g., 10A, 10B, 11A"
                                                    className="w-full bg-white/50 dark:bg-slate-600/50 border border-white/20 dark:border-slate-500/30 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-slate-800 dark:text-white"
                                                />
                                            ) : (
                                                <p className="text-slate-800 dark:text-white font-medium">
                                                    {userDetails?.classesAssigned || 'Not assigned'}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {user?.role === 'mentee' && (
                                <div className="bg-white/50 dark:bg-slate-700/50 backdrop-blur-sm rounded-2xl p-6">
                                    <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center">
                                        <GraduationCap className="h-5 w-5 mr-2" />
                                        Student Information
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                                Student ID
                                            </label>
                                            <p className="text-slate-800 dark:text-white font-medium">
                                                {userDetails?.studentId || 'Auto-generated'}
                                            </p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                                Class & Section
                                            </label>
                                            <p className="text-slate-800 dark:text-white font-medium">
                                                {userDetails?.class && userDetails?.section
                                                    ? `${userDetails.class}-${userDetails.section}`
                                                    : 'Not assigned'
                                                }
                                            </p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                                Blood Group
                                            </label>
                                            {editMode ? (
                                                <select
                                                    value={formData.bloodGroup || ''}
                                                    onChange={(e) => handleInputChange('bloodGroup', e.target.value)}
                                                    className="w-full bg-white/50 dark:bg-slate-600/50 border border-white/20 dark:border-slate-500/30 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-slate-800 dark:text-white"
                                                >
                                                    <option value="">Select Blood Group</option>
                                                    <option value="A+">A+</option>
                                                    <option value="A-">A-</option>
                                                    <option value="B+">B+</option>
                                                    <option value="B-">B-</option>
                                                    <option value="AB+">AB+</option>
                                                    <option value="AB-">AB-</option>
                                                    <option value="O+">O+</option>
                                                    <option value="O-">O-</option>
                                                </select>
                                            ) : (
                                                <p className="text-slate-800 dark:text-white font-medium">
                                                    {userDetails?.bloodGroup || 'Not provided'}
                                                </p>
                                            )}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                                Age
                                            </label>
                                            <p className="text-slate-800 dark:text-white font-medium">
                                                {userDetails?.dateOfBirth
                                                    ? Math.floor((new Date() - new Date(userDetails.dateOfBirth)) / (365.25 * 24 * 60 * 60 * 1000))
                                                    : 'Not calculated'
                                                } years
                                            </p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                                Father's Name
                                            </label>
                                            {editMode ? (
                                                <input
                                                    type="text"
                                                    value={formData.fatherName || ''}
                                                    onChange={(e) => handleInputChange('fatherName', e.target.value)}
                                                    className="w-full bg-white/50 dark:bg-slate-600/50 border border-white/20 dark:border-slate-500/30 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-slate-800 dark:text-white"
                                                />
                                            ) : (
                                                <p className="text-slate-800 dark:text-white font-medium">
                                                    {userDetails?.fatherName || 'Not provided'}
                                                </p>
                                            )}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                                Mother's Name
                                            </label>
                                            {editMode ? (
                                                <input
                                                    type="text"
                                                    value={formData.motherName || ''}
                                                    onChange={(e) => handleInputChange('motherName', e.target.value)}
                                                    className="w-full bg-white/50 dark:bg-slate-600/50 border border-white/20 dark:border-slate-500/30 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-slate-800 dark:text-white"
                                                />
                                            ) : (
                                                <p className="text-slate-800 dark:text-white font-medium">
                                                    {userDetails?.motherName || 'Not provided'}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default UserDetailsModal