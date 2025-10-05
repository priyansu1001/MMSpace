import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import Layout from '../components/Layout'
import LoadingSpinner from '../components/LoadingSpinner'
import { User, Mail, Phone, Building, Calendar, BookOpen } from 'lucide-react'

const ProfilePage = () => {
    const { user, profile } = useAuth()
    const [loading, setLoading] = useState(false)

    if (!profile) {
        return (
            <Layout>
                <div className="flex items-center justify-center h-64">
                    <LoadingSpinner />
                </div>
            </Layout>
        )
    }

    const MentorProfile = () => (
        <div className="space-y-8">
            {/* Profile Header */}
            <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl shadow-2xl rounded-3xl border border-white/20 dark:border-slate-700/50 p-8">
                <div className="flex items-center space-x-6">
                    <div className="flex-shrink-0">
                        <div className="h-24 w-24 rounded-3xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-2xl">
                            <span className="text-3xl font-bold text-white">
                                {profile.fullName?.charAt(0)}
                            </span>
                        </div>
                    </div>
                    <div className="flex-1 min-w-0">
                        <h1 className="text-3xl font-bold text-slate-800 dark:text-white">{profile.fullName}</h1>
                        <p className="text-lg text-slate-600 dark:text-slate-300 capitalize font-medium">{user.role}</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Employee ID: {profile.employeeId}</p>
                    </div>
                </div>
            </div>

            {/* Information Cards */}
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                {/* Contact Information */}
                <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl shadow-2xl rounded-3xl border border-white/20 dark:border-slate-700/50 p-8">
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-6">Contact Information</h3>
                    <div className="space-y-6">
                        <div className="flex items-center space-x-4">
                            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg">
                                <Mail className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <dt className="text-sm font-semibold text-slate-600 dark:text-slate-400">Email</dt>
                                <dd className="text-lg font-medium text-slate-800 dark:text-white">{user.email}</dd>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg">
                                <Phone className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <dt className="text-sm font-semibold text-slate-600 dark:text-slate-400">Phone</dt>
                                <dd className="text-lg font-medium text-slate-800 dark:text-white">{profile.phone || 'Not provided'}</dd>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-lg">
                                <Building className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <dt className="text-sm font-semibold text-slate-600 dark:text-slate-400">Department</dt>
                                <dd className="text-lg font-medium text-slate-800 dark:text-white">{profile.department}</dd>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Professional Information */}
                <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl shadow-2xl rounded-3xl border border-white/20 dark:border-slate-700/50 p-8">
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-6">Professional Information</h3>
                    <div className="space-y-6">
                        <div className="flex items-center space-x-4">
                            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center shadow-lg">
                                <BookOpen className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <dt className="text-sm font-semibold text-slate-600 dark:text-slate-400">Subjects</dt>
                                <dd className="text-lg font-medium text-slate-800 dark:text-white">
                                    {profile.subjects?.length > 0 ? profile.subjects.join(', ') : 'Not specified'}
                                </dd>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
                                <Calendar className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <dt className="text-sm font-semibold text-slate-600 dark:text-slate-400">Experience</dt>
                                <dd className="text-lg font-medium text-slate-800 dark:text-white">{profile.experience || 0} years</dd>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-teal-500 to-green-600 flex items-center justify-center shadow-lg">
                                <User className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <dt className="text-sm font-semibold text-slate-600 dark:text-slate-400">Office Hours</dt>
                                <dd className="text-lg font-medium text-slate-800 dark:text-white">{profile.officeHours || 'Not specified'}</dd>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Qualifications */}
            {profile.qualifications && (
                <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl shadow-2xl rounded-3xl border border-white/20 dark:border-slate-700/50 p-8">
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-6">Qualifications</h3>
                    <div className="bg-white/50 dark:bg-slate-700/50 backdrop-blur-sm rounded-2xl p-6">
                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{profile.qualifications}</p>
                    </div>
                </div>
            )}
        </div>
    )

    const MenteeProfile = () => (
        <div className="space-y-8">
            {/* Profile Header */}
            <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl shadow-2xl rounded-3xl border border-white/20 dark:border-slate-700/50 p-8">
                <div className="flex items-center space-x-6">
                    <div className="flex-shrink-0">
                        <div className="h-24 w-24 rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-2xl">
                            <span className="text-3xl font-bold text-white">
                                {profile.fullName?.charAt(0)}
                            </span>
                        </div>
                    </div>
                    <div className="flex-1 min-w-0">
                        <h1 className="text-3xl font-bold text-slate-800 dark:text-white">{profile.fullName}</h1>
                        <p className="text-lg text-slate-600 dark:text-slate-300 capitalize font-medium">{user.role}</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Student ID: {profile.studentId}</p>
                    </div>
                </div>
            </div>

            {/* Information Cards */}
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                {/* Personal Information */}
                <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl shadow-2xl rounded-3xl border border-white/20 dark:border-slate-700/50 p-8">
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-6">Personal Information</h3>
                    <div className="space-y-6">
                        <div className="flex items-center space-x-4">
                            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg">
                                <Mail className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <dt className="text-sm font-semibold text-slate-600 dark:text-slate-400">Email</dt>
                                <dd className="text-lg font-medium text-slate-800 dark:text-white">{user.email}</dd>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg">
                                <Phone className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <dt className="text-sm font-semibold text-slate-600 dark:text-slate-400">Phone</dt>
                                <dd className="text-lg font-medium text-slate-800 dark:text-white">{profile.phone || 'Not provided'}</dd>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-lg">
                                <Calendar className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <dt className="text-sm font-semibold text-slate-600 dark:text-slate-400">Date of Birth</dt>
                                <dd className="text-lg font-medium text-slate-800 dark:text-white">
                                    {profile.dateOfBirth
                                        ? new Date(profile.dateOfBirth).toLocaleDateString()
                                        : 'Not provided'
                                    }
                                </dd>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Academic Information */}
                <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl shadow-2xl rounded-3xl border border-white/20 dark:border-slate-700/50 p-8">
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-6">Academic Information</h3>
                    <div className="space-y-6">
                        <div className="flex items-center space-x-4">
                            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center shadow-lg">
                                <BookOpen className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <dt className="text-sm font-semibold text-slate-600 dark:text-slate-400">Class</dt>
                                <dd className="text-lg font-medium text-slate-800 dark:text-white">{profile.class}</dd>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
                                <Building className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <dt className="text-sm font-semibold text-slate-600 dark:text-slate-400">Section</dt>
                                <dd className="text-lg font-medium text-slate-800 dark:text-white">{profile.section}</dd>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-teal-500 to-green-600 flex items-center justify-center shadow-lg">
                                <Calendar className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <dt className="text-sm font-semibold text-slate-600 dark:text-slate-400">Academic Year</dt>
                                <dd className="text-lg font-medium text-slate-800 dark:text-white">{profile.academicYear}</dd>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Attendance */}
            <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl shadow-2xl rounded-3xl border border-white/20 dark:border-slate-700/50 p-8">
                <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-6">Attendance Overview</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-gradient-to-br from-slate-500 to-slate-600 rounded-2xl p-6 text-center shadow-lg">
                        <p className="text-3xl font-bold text-white mb-2">
                            {profile.attendance?.totalDays || 0}
                        </p>
                        <p className="text-slate-200 font-medium">Total Days</p>
                    </div>
                    <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-center shadow-lg">
                        <p className="text-3xl font-bold text-white mb-2">
                            {profile.attendance?.presentDays || 0}
                        </p>
                        <p className="text-green-100 font-medium">Present Days</p>
                    </div>
                    <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-6 text-center shadow-lg">
                        <p className="text-3xl font-bold text-white mb-2">
                            {profile.attendance?.percentage || 0}%
                        </p>
                        <p className="text-blue-100 font-medium">Percentage</p>
                    </div>
                </div>
            </div>

            {/* Parent Information */}
            {profile.parentInfo && (
                <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl shadow-2xl rounded-3xl border border-white/20 dark:border-slate-700/50 p-8">
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-6">Parent Information</h3>
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <div className="bg-white/50 dark:bg-slate-700/50 backdrop-blur-sm rounded-2xl p-6">
                            <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-2">Father's Name</p>
                            <p className="text-lg font-medium text-slate-800 dark:text-white">{profile.parentInfo.fatherName || 'Not provided'}</p>
                        </div>
                        <div className="bg-white/50 dark:bg-slate-700/50 backdrop-blur-sm rounded-2xl p-6">
                            <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-2">Mother's Name</p>
                            <p className="text-lg font-medium text-slate-800 dark:text-white">{profile.parentInfo.motherName || 'Not provided'}</p>
                        </div>
                        <div className="bg-white/50 dark:bg-slate-700/50 backdrop-blur-sm rounded-2xl p-6">
                            <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-2">Primary Contact</p>
                            <p className="text-lg font-medium text-slate-800 dark:text-white">{profile.parentInfo.primaryContact || 'Not provided'}</p>
                        </div>
                        <div className="bg-white/50 dark:bg-slate-700/50 backdrop-blur-sm rounded-2xl p-6">
                            <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-2">Emergency Contact</p>
                            <p className="text-lg font-medium text-slate-800 dark:text-white">{profile.parentInfo.emergencyContact || 'Not provided'}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )

    return (
        <Layout>
            <div className="space-y-8">
                {/* Page Header */}
                <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl shadow-2xl rounded-3xl border border-white/20 dark:border-slate-700/50 p-8">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 dark:from-white dark:to-slate-200 bg-clip-text text-transparent">
                        Profile
                    </h1>
                    <p className="mt-2 text-slate-600 dark:text-slate-300">
                        View and manage your profile information.
                    </p>
                </div>

                {user.role === 'mentor' ? <MentorProfile /> : <MenteeProfile />}
            </div>
        </Layout>
    )
}

export default ProfilePage