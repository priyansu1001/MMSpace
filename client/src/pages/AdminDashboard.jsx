import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Layout from '../components/Layout'
import LoadingSpinner from '../components/LoadingSpinner'
import UserDetailsModal from '../components/UserDetailsModal'
import AttendanceManagementModal from '../components/AttendanceManagementModal'
import api from '../services/api'
import {
    Users,
    UserCheck,
    GraduationCap,
    Shield,
    Calendar,
    MessageSquare,
    Eye,
    Edit,
    Trash2,
    UserPlus,
    ToggleLeft,
    ToggleRight
} from 'lucide-react'
import { toast } from 'react-hot-toast'

const AdminDashboard = () => {
    const { user } = useAuth()
    const navigate = useNavigate()
    const [dashboardData, setDashboardData] = useState(null)
    const [users, setUsers] = useState([])
    const [mentors, setMentors] = useState([])
    const [mentees, setMentees] = useState([])
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState('overview')
    const [selectedUser, setSelectedUser] = useState(null)
    const [showUserModal, setShowUserModal] = useState(false)
    const [showAttendanceModal, setShowAttendanceModal] = useState(false)

    useEffect(() => {
        fetchDashboardData()
        fetchUsers()
        fetchMentors()
        fetchMentees()
    }, [])

    const fetchDashboardData = async () => {
        try {
            const response = await api.get('/admin/dashboard')
            setDashboardData(response.data)
        } catch (error) {
            console.error('Error fetching dashboard data:', error)
        }
    }

    const fetchUsers = async () => {
        try {
            const response = await api.get('/admin/users')
            setUsers(response.data.users)
        } catch (error) {
            console.error('Error fetching users:', error)
        }
    }

    const fetchMentors = async () => {
        try {
            const response = await api.get('/admin/mentors')
            setMentors(response.data)
        } catch (error) {
            console.error('Error fetching mentors:', error)
        }
    }

    const fetchMentees = async () => {
        try {
            const response = await api.get('/admin/mentees')
            setMentees(response.data)
        } catch (error) {
            console.error('Error fetching mentees:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleToggleUserStatus = async (userId) => {
        try {
            await api.put(`/admin/users/${userId}/toggle-status`)
            toast.success('User status updated successfully')
            fetchUsers()
        } catch (error) {
            toast.error('Failed to update user status')
        }
    }

    const handleDeleteUser = async (userId) => {
        if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
            try {
                await api.delete(`/admin/users/${userId}`)
                toast.success('User deleted successfully')
                fetchUsers()
                fetchMentors()
                fetchMentees()
                fetchDashboardData()
            } catch (error) {
                toast.error('Failed to delete user')
            }
        }
    }

    const handleAssignMentor = async (menteeId, mentorId) => {
        try {
            await api.put('/admin/assign-mentor', { menteeId, mentorId })
            toast.success('Mentor assigned successfully')
            fetchMentees()
        } catch (error) {
            toast.error('Failed to assign mentor')
        }
    }

    if (loading) {
        return (
            <Layout>
                <div className="flex items-center justify-center h-64">
                    <LoadingSpinner />
                </div>
            </Layout>
        )
    }

    const OverviewTab = () => (
        <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                <div
                    onClick={() => setActiveTab('users')}
                    className="relative overflow-hidden bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer"
                >
                    <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
                    <div className="relative p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-blue-100 text-sm font-medium">Total Users</p>
                                <p className="text-white text-3xl font-bold mt-1">
                                    {dashboardData?.stats?.totalUsers || 0}
                                </p>
                                <p className="text-blue-100 text-xs mt-1">All system users</p>
                            </div>
                            <div className="bg-white/20 p-3 rounded-full">
                                <Users className="h-8 w-8 text-white" />
                            </div>
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-300 to-blue-400"></div>
                    </div>
                </div>

                <div
                    onClick={() => setActiveTab('mentors')}
                    className="relative overflow-hidden bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer"
                >
                    <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
                    <div className="relative p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-indigo-100 text-sm font-medium">Mentors</p>
                                <p className="text-white text-3xl font-bold mt-1">
                                    {dashboardData?.stats?.totalMentors || 0}
                                </p>
                                <p className="text-indigo-100 text-xs mt-1">Active teachers</p>
                            </div>
                            <div className="bg-white/20 p-3 rounded-full">
                                <Shield className="h-8 w-8 text-white" />
                            </div>
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-300 to-purple-400"></div>
                    </div>
                </div>

                <div
                    onClick={() => setActiveTab('mentors')}
                    className="relative overflow-hidden bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer"
                >
                    <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
                    <div className="relative p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-green-100 text-sm font-medium">Mentees</p>
                                <p className="text-white text-3xl font-bold mt-1">
                                    {dashboardData?.stats?.totalMentees || 0}
                                </p>
                                <p className="text-green-100 text-xs mt-1">Active students</p>
                            </div>
                            <div className="bg-white/20 p-3 rounded-full">
                                <GraduationCap className="h-8 w-8 text-white" />
                            </div>
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-green-300 to-emerald-400"></div>
                    </div>
                </div>

                <div
                    onClick={() => navigate('/groups')}
                    className="relative overflow-hidden bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer"
                >
                    <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
                    <div className="relative p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-purple-100 text-sm font-medium">Groups</p>
                                <p className="text-white text-3xl font-bold mt-1">
                                    {dashboardData?.stats?.totalGroups || 0}
                                </p>
                                <p className="text-purple-100 text-xs mt-1">Discussion groups</p>
                            </div>
                            <div className="bg-white/20 p-3 rounded-full">
                                <MessageSquare className="h-8 w-8 text-white" />
                            </div>
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-300 to-pink-400"></div>
                    </div>
                </div>

                <div
                    onClick={() => navigate('/leaves')}
                    className="relative overflow-hidden bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer"
                >
                    <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
                    <div className="relative p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-amber-100 text-sm font-medium">Pending Leaves</p>
                                <p className="text-white text-3xl font-bold mt-1">
                                    {dashboardData?.stats?.pendingLeaves || 0}
                                </p>
                                <p className="text-amber-100 text-xs mt-1">Awaiting approval</p>
                            </div>
                            <div className="bg-white/20 p-3 rounded-full">
                                <Calendar className="h-8 w-8 text-white" />
                            </div>
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-300 to-orange-400"></div>
                    </div>
                </div>

                <div
                    onClick={() => setActiveTab('users')}
                    className="relative overflow-hidden bg-gradient-to-br from-teal-500 to-cyan-600 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer"
                >
                    <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
                    <div className="relative p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-teal-100 text-sm font-medium">Active Users</p>
                                <p className="text-white text-3xl font-bold mt-1">
                                    {dashboardData?.stats?.activeUsers || 0}
                                </p>
                                <p className="text-teal-100 text-xs mt-1">Currently online</p>
                            </div>
                            <div className="bg-white/20 p-3 rounded-full">
                                <UserCheck className="h-8 w-8 text-white" />
                            </div>
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-300 to-cyan-400"></div>
                    </div>
                </div>
            </div>

            {/* Recent Activities */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white shadow rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                        <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                            Recent Users
                        </h3>
                        <div className="flow-root">
                            <ul className="-my-5 divide-y divide-gray-200">
                                {dashboardData?.recentUsers?.map((user) => (
                                    <li key={user._id} className="py-4">
                                        <div className="flex items-center space-x-4">
                                            <div className="flex-shrink-0">
                                                <div className={`h-8 w-8 rounded-full flex items-center justify-center ${user.role === 'admin' ? 'bg-red-100' :
                                                    user.role === 'mentor' ? 'bg-blue-100' : 'bg-green-100'
                                                    }`}>
                                                    {user.role === 'admin' ? <Shield className="h-4 w-4 text-red-600" /> :
                                                        user.role === 'mentor' ? <Shield className="h-4 w-4 text-blue-600" /> :
                                                            <GraduationCap className="h-4 w-4 text-green-600" />}
                                                </div>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-900 truncate">
                                                    {user.email}
                                                </p>
                                                <p className="text-sm text-gray-500 capitalize">
                                                    {user.role} • {new Date(user.createdAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="bg-white shadow rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                        <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                            Recent Leave Requests
                        </h3>
                        <div className="flow-root">
                            <ul className="-my-5 divide-y divide-gray-200">
                                {dashboardData?.recentLeaves?.map((leave) => (
                                    <li key={leave._id} className="py-4">
                                        <div className="flex items-center space-x-4">
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-900 truncate">
                                                    {leave.menteeId?.fullName}
                                                </p>
                                                <p className="text-sm text-gray-500">
                                                    {leave.leaveType} - {leave.daysCount} days
                                                </p>
                                            </div>
                                            <div className="flex-shrink-0">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${leave.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                    leave.status === 'approved' ? 'bg-green-100 text-green-800' :
                                                        'bg-red-100 text-red-800'
                                                    }`}>
                                                    {leave.status}
                                                </span>
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )

    const UsersTab = () => (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl shadow-2xl rounded-3xl border border-white/20 dark:border-slate-700/50 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center">
                            <Users className="h-6 w-6 mr-3 text-blue-600 dark:text-blue-400" />
                            User Management ({users.length})
                        </h3>
                        <p className="text-slate-600 dark:text-slate-400 mt-1">
                            Manage all system users, their details, and attendance
                        </p>
                    </div>
                    <div className="flex space-x-3">
                        <button
                            onClick={() => setShowAttendanceModal(true)}
                            className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                        >
                            <Calendar className="h-4 w-4 mr-2" />
                            Manage Attendance
                        </button>
                        <Link
                            to="/admin/signup"
                            className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                        >
                            <Shield className="h-4 w-4 mr-2" />
                            Add Admin
                        </Link>
                        <button className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                            <UserPlus className="h-4 w-4 mr-2" />
                            Add User
                        </button>
                    </div>
                </div>
            </div>

            {/* Users Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {users.map((user, index) => (
                    <div
                        key={user._id}
                        className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl shadow-lg rounded-2xl border border-white/20 dark:border-slate-700/50 hover:shadow-xl transition-all duration-300 hover:scale-[1.02] message-bubble"
                        style={{ animationDelay: `${index * 0.1}s` }}
                    >
                        <div className="p-6">
                            {/* User Header */}
                            <div className="flex items-center space-x-4 mb-4">
                                <div className={`h-16 w-16 rounded-2xl flex items-center justify-center shadow-lg ${user.role === 'admin' ? 'bg-gradient-to-br from-red-500 to-red-600' :
                                    user.role === 'mentor' ? 'bg-gradient-to-br from-blue-500 to-indigo-600' :
                                        'bg-gradient-to-br from-green-500 to-emerald-600'
                                    }`}>
                                    {user.role === 'admin' ? <Shield className="h-8 w-8 text-white" /> :
                                        user.role === 'mentor' ? <User className="h-8 w-8 text-white" /> :
                                            <GraduationCap className="h-8 w-8 text-white" />}
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                                        {user.profile?.fullName || 'No Name'}
                                    </h3>
                                    <p className="text-sm text-slate-600 dark:text-slate-400">
                                        {user.email}
                                    </p>
                                    <div className="flex items-center space-x-2 mt-1">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${user.role === 'admin' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' :
                                            user.role === 'mentor' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' :
                                                'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                            }`}>
                                            {user.role}
                                        </span>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${user.isActive
                                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                            : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                                            }`}>
                                            {user.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* User Info */}
                            <div className="bg-white/50 dark:bg-slate-700/50 backdrop-blur-sm rounded-xl p-3 mb-4">
                                <div className="text-sm text-slate-600 dark:text-slate-400">
                                    <p><strong>Last Login:</strong> {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}</p>
                                    <p><strong>Created:</strong> {new Date(user.createdAt).toLocaleDateString()}</p>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => {
                                        setSelectedUser(user)
                                        setShowUserModal(true)
                                    }}
                                    className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white py-2 px-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center justify-center"
                                >
                                    <Edit className="h-4 w-4 mr-1" />
                                    Edit
                                </button>
                                <button
                                    onClick={() => handleToggleUserStatus(user._id)}
                                    className={`flex-1 py-2 px-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center justify-center ${user.isActive
                                        ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white'
                                        : 'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
                                        }`}
                                >
                                    {user.isActive ? <ToggleRight className="h-4 w-4 mr-1" /> : <ToggleLeft className="h-4 w-4 mr-1" />}
                                    {user.isActive ? 'Disable' : 'Enable'}
                                </button>
                                <button
                                    onClick={() => handleDeleteUser(user._id)}
                                    className="p-2 rounded-xl bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 transition-all duration-300 hover:scale-110"
                                    title="Delete User"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )

    const MentorMenteeTab = () => (
        <div className="space-y-6">
            {/* Mentors Section */}
            <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                        Mentors ({mentors.length})
                    </h3>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {mentors.map((mentor) => (
                            <div key={mentor._id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                                <div className="flex items-center space-x-3">
                                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                        <Shield className="h-5 w-5 text-blue-600" />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="text-sm font-medium text-gray-900">{mentor.fullName}</h4>
                                        <p className="text-sm text-gray-500">{mentor.department}</p>
                                    </div>
                                </div>
                                <div className="mt-3 flex justify-between text-sm text-gray-500">
                                    <span>{mentor.stats?.menteeCount || 0} mentees</span>
                                    <span>{mentor.stats?.groupCount || 0} groups</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Mentees Section */}
            <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                        Mentees ({mentees.length})
                    </h3>
                    <div className="overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Student
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Class/Section
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Assigned Mentor
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Attendance
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {mentees.map((mentee) => (
                                    <tr key={mentee._id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                                                    <GraduationCap className="h-4 w-4 text-green-600" />
                                                </div>
                                                <div className="ml-3">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {mentee.fullName}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        ID: {mentee.studentId}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">
                                                Class {mentee.class}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                Section {mentee.section}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">
                                                {mentee.mentorId?.fullName || 'Unassigned'}
                                            </div>
                                            <select
                                                className="mt-1 text-xs border-gray-300 rounded"
                                                onChange={(e) => handleAssignMentor(mentee._id, e.target.value)}
                                                defaultValue={mentee.mentorId?._id || ''}
                                            >
                                                <option value="">Select Mentor</option>
                                                {mentors.map((mentor) => (
                                                    <option key={mentor._id} value={mentor._id}>
                                                        {mentor.fullName}
                                                    </option>
                                                ))}
                                            </select>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">
                                                {mentee.attendance?.percentage || 0}%
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex space-x-2">
                                                <button className="text-primary-600 hover:text-primary-900">
                                                    <Eye className="h-4 w-4" />
                                                </button>
                                                <button className="text-gray-600 hover:text-gray-900">
                                                    <Edit className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    )

    return (
        <Layout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                    <p className="mt-1 text-sm text-gray-600">
                        Manage users, mentors, mentees, and system settings.
                    </p>
                </div>

                {/* Tab Navigation */}
                <div className="border-b border-gray-200">
                    <nav className="-mb-px flex space-x-8">
                        {[
                            { id: 'overview', name: 'Overview' },
                            { id: 'users', name: 'Users' },
                            { id: 'mentors-mentees', name: 'Mentors & Mentees' }
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === tab.id
                                    ? 'border-primary-500 text-primary-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                {tab.name}
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Tab Content */}
                {activeTab === 'overview' && <OverviewTab />}
                {activeTab === 'users' && <UsersTab />}
                {activeTab === 'mentors-mentees' && <MentorMenteeTab />}

                {/* Modals */}
                <UserDetailsModal
                    user={selectedUser}
                    isOpen={showUserModal}
                    onClose={() => {
                        setShowUserModal(false)
                        setSelectedUser(null)
                    }}
                    onUpdate={(updatedUser) => {
                        // Update the user in the users array
                        setUsers(prev => prev.map(u => u._id === updatedUser._id ? { ...u, profile: updatedUser } : u))
                    }}
                />

                <AttendanceManagementModal
                    isOpen={showAttendanceModal}
                    onClose={() => setShowAttendanceModal(false)}
                />
            </div>
        </Layout>
    )
}

export default AdminDashboard