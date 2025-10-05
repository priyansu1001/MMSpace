import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import Layout from '../components/Layout'
import LoadingSpinner from '../components/LoadingSpinner'
import GroupDetailsModal from '../components/GroupDetailsModal'
import api from '../services/api'
import { Plus, Users, Edit, Trash2, Shield } from 'lucide-react'
import ChatIcon from '../components/icons/ChatIcon'
import DetailsIcon from '../components/icons/DetailsIcon'
import { toast } from 'react-hot-toast'

const GroupsPage = () => {
    const { user } = useAuth()
    const [groups, setGroups] = useState([])
    const [mentees, setMentees] = useState([])
    const [loading, setLoading] = useState(true)
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [showEditModal, setShowEditModal] = useState(false)
    const [showDetailsModal, setShowDetailsModal] = useState(false)
    const [selectedGroup, setSelectedGroup] = useState(null)
    const [newGroup, setNewGroup] = useState({
        name: '',
        description: '',
        color: '#3B82F6',
        menteeIds: []
    })

    useEffect(() => {
        if (user.role === 'mentor') {
            fetchGroups()
            fetchMentees()
        }
    }, [user.role])

    const fetchGroups = async () => {
        try {
            const response = await api.get('/groups')
            setGroups(response.data)
        } catch (error) {
            toast.error('Failed to fetch groups')
        } finally {
            setLoading(false)
        }
    }

    const fetchMentees = async () => {
        try {
            const response = await api.get('/mentors/mentees')
            setMentees(response.data)
        } catch (error) {
            console.error('Error fetching mentees:', error)
        }
    }

    const handleCreateGroup = async (e) => {
        e.preventDefault()
        try {
            const response = await api.post('/groups', newGroup)
            setGroups([...groups, response.data])
            setShowCreateModal(false)
            setNewGroup({ name: '', description: '', color: '#3B82F6', menteeIds: [] })
            toast.success('Group created successfully!')
        } catch (error) {
            toast.error('Failed to create group')
        }
    }

    const handleDeleteGroup = async (groupId) => {
        if (window.confirm('Are you sure you want to archive this group?')) {
            try {
                await api.delete(`/groups/${groupId}`)
                setGroups(groups.filter(group => group._id !== groupId))
                toast.success('Group archived successfully!')
            } catch (error) {
                toast.error('Failed to archive group')
            }
        }
    }

    const handleEditGroup = (group) => {
        setSelectedGroup(group)
        setNewGroup({
            name: group.name,
            description: group.description,
            color: group.color,
            menteeIds: group.menteeIds?.map(m => m._id) || []
        })
        setShowEditModal(true)
    }

    const handleUpdateGroup = async (e) => {
        e.preventDefault()
        try {
            const response = await api.put(`/groups/${selectedGroup._id}`, newGroup)
            setGroups(groups.map(group =>
                group._id === selectedGroup._id ? response.data : group
            ))
            setShowEditModal(false)
            setSelectedGroup(null)
            setNewGroup({ name: '', description: '', color: '#3B82F6', menteeIds: [] })
            toast.success('Group updated successfully!')
        } catch (error) {
            toast.error('Failed to update group')
        }
    }

    if (user.role !== 'mentor') {
        return (
            <Layout>
                <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl shadow-2xl rounded-3xl border border-white/20 dark:border-slate-700/50 p-12">
                    <div className="text-center">
                        <div className="h-24 w-24 bg-gradient-to-br from-red-400 to-red-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl">
                            <Shield className="h-12 w-12 text-white" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">
                            Access Denied
                        </h2>
                        <p className="text-slate-500 dark:text-slate-400">
                            Only mentors can manage groups.
                        </p>
                    </div>
                </div>
            </Layout>
        )
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

    return (
        <Layout>
            <div className="space-y-8">
                {/* Header */}
                <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl shadow-2xl rounded-3xl border border-white/20 dark:border-slate-700/50 p-8">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 dark:from-white dark:to-slate-200 bg-clip-text text-transparent">
                                Groups
                            </h1>
                            <p className="mt-2 text-slate-600 dark:text-slate-300">
                                Manage your mentee groups and organize students effectively.
                            </p>
                        </div>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-2xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                        >
                            <Plus className="h-5 w-5 mr-2" />
                            Create Group
                        </button>
                    </div>
                </div>

                {/* Groups Grid */}
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {groups.map((group, index) => (
                        <div
                            key={group._id}
                            className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl shadow-lg rounded-3xl border border-white/20 dark:border-slate-700/50 hover:shadow-xl transition-all duration-300 hover:scale-[1.02] message-bubble"
                            style={{ animationDelay: `${index * 0.1}s` }}
                        >
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center space-x-3">
                                        <div
                                            className="h-12 w-12 rounded-2xl flex items-center justify-center shadow-lg"
                                            style={{
                                                background: `linear-gradient(135deg, ${group.color}dd, ${group.color})`
                                            }}
                                        >
                                            <Users className="h-6 w-6 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-slate-800 dark:text-white truncate">
                                                {group.name}
                                            </h3>
                                            <div className="flex items-center text-sm text-slate-500 dark:text-slate-400">
                                                <Users className="h-3 w-3 mr-1" />
                                                {group.menteeIds?.length || 0} members
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => handleEditGroup(group)}
                                            className="p-2 rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-all duration-300"
                                        >
                                            <Edit className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteGroup(group._id)}
                                            className="p-2 rounded-xl bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 transition-all duration-300"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>

                                <div className="bg-white/50 dark:bg-slate-700/50 backdrop-blur-sm rounded-2xl p-4 mb-4">
                                    <p className="text-sm text-slate-700 dark:text-slate-300">
                                        {group.description || 'No description provided'}
                                    </p>
                                </div>

                                <div className="space-y-3">
                                    <button
                                        onClick={() => window.location.href = `/chat/${group._id}`}
                                        className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 px-4 rounded-2xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] flex items-center justify-center"
                                    >
                                        <ChatIcon className="w-5 h-5 mr-2" />
                                        Open Group Chat
                                    </button>
                                    <button
                                        onClick={() => {
                                            setSelectedGroup(group)
                                            setShowDetailsModal(true)
                                        }}
                                        className="w-full bg-white/50 dark:bg-slate-700/50 hover:bg-white/80 dark:hover:bg-slate-600/50 text-slate-700 dark:text-slate-300 font-medium py-3 px-4 rounded-2xl transition-all duration-300 hover:scale-[1.02] flex items-center justify-center"
                                    >
                                        <DetailsIcon className="w-5 h-5 mr-2" />
                                        View Details
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {groups.length === 0 && (
                    <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl shadow-2xl rounded-3xl border border-white/20 dark:border-slate-700/50 p-12">
                        <div className="text-center">
                            <div className="h-24 w-24 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl">
                                <Users className="h-12 w-12 text-white" />
                            </div>
                            <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">
                                No Groups Yet
                            </h3>
                            <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-md mx-auto">
                                Get started by creating your first group to organize and manage your mentees effectively.
                            </p>
                            <button
                                onClick={() => setShowCreateModal(true)}
                                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                            >
                                <Plus className="h-5 w-5 mr-2" />
                                Create Your First Group
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Create Group Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
                    <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 dark:border-slate-700/50 w-full max-w-lg">
                        <div className="p-8">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center space-x-3">
                                    <div className="h-12 w-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                                        <Plus className="h-6 w-6 text-white" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-slate-800 dark:text-white">
                                        Create New Group
                                    </h3>
                                </div>
                                <button
                                    onClick={() => setShowCreateModal(false)}
                                    className="p-2 rounded-full hover:bg-slate-100/50 dark:hover:bg-slate-700/50 transition-colors duration-200"
                                >
                                    <Plus className="h-5 w-5 text-slate-600 dark:text-slate-400 rotate-45" />
                                </button>
                            </div>

                            <form onSubmit={handleCreateGroup} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                        Group Name
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={newGroup.name}
                                        onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
                                        className="w-full bg-white/50 dark:bg-slate-700/50 border border-white/20 dark:border-slate-600/30 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-slate-800 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 backdrop-blur-sm"
                                        placeholder="e.g., Class 10-A Mathematics"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                        Description
                                    </label>
                                    <textarea
                                        value={newGroup.description}
                                        onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })}
                                        className="w-full bg-white/50 dark:bg-slate-700/50 border border-white/20 dark:border-slate-600/30 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-slate-800 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 backdrop-blur-sm resize-none"
                                        rows="3"
                                        placeholder="Optional description for the group"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                        Select Mentees ({newGroup.menteeIds.length} selected)
                                    </label>
                                    <div className="max-h-48 overflow-y-auto bg-white/50 dark:bg-slate-700/50 border border-white/20 dark:border-slate-600/30 rounded-2xl p-3 backdrop-blur-sm">
                                        {mentees.map((mentee) => (
                                            <label key={mentee._id} className="flex items-center space-x-3 p-3 hover:bg-white/50 dark:hover:bg-slate-600/50 rounded-xl cursor-pointer transition-colors duration-200">
                                                <input
                                                    type="checkbox"
                                                    checked={newGroup.menteeIds.includes(mentee._id)}
                                                    onChange={(e) => {
                                                        if (e.target.checked) {
                                                            setNewGroup({
                                                                ...newGroup,
                                                                menteeIds: [...newGroup.menteeIds, mentee._id]
                                                            })
                                                        } else {
                                                            setNewGroup({
                                                                ...newGroup,
                                                                menteeIds: newGroup.menteeIds.filter(id => id !== mentee._id)
                                                            })
                                                        }
                                                    }}
                                                    className="rounded-lg border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500"
                                                />
                                                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white font-bold text-sm">
                                                    {mentee.fullName?.charAt(0)}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="text-sm font-semibold text-slate-800 dark:text-white">{mentee.fullName}</div>
                                                    <div className="text-xs text-slate-500 dark:text-slate-400">{mentee.class}-{mentee.section} • {mentee.studentId}</div>
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                        Group Color
                                    </label>
                                    <div className="flex items-center space-x-3">
                                        <input
                                            type="color"
                                            value={newGroup.color}
                                            onChange={(e) => setNewGroup({ ...newGroup, color: e.target.value })}
                                            className="w-16 h-12 border-2 border-white/20 dark:border-slate-600/30 rounded-xl cursor-pointer"
                                        />
                                        <div className="flex-1 bg-white/50 dark:bg-slate-700/50 border border-white/20 dark:border-slate-600/30 rounded-2xl px-4 py-3 backdrop-blur-sm">
                                            <span className="text-sm text-slate-700 dark:text-slate-300">{newGroup.color}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex space-x-4 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowCreateModal(false)}
                                        className="flex-1 px-6 py-3 text-slate-700 dark:text-slate-300 bg-slate-100/50 dark:bg-slate-700/50 hover:bg-slate-200/50 dark:hover:bg-slate-600/50 rounded-2xl font-medium transition-all duration-300"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-2xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                                    >
                                        Create Group
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Group Modal */}
            {showEditModal && selectedGroup && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
                    <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 dark:border-slate-700/50 w-full max-w-lg">
                        <div className="p-8">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center space-x-3">
                                    <div
                                        className="h-12 w-12 rounded-2xl flex items-center justify-center shadow-lg"
                                        style={{
                                            background: `linear-gradient(135deg, ${selectedGroup.color}dd, ${selectedGroup.color})`
                                        }}
                                    >
                                        <Edit className="h-6 w-6 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-bold text-slate-800 dark:text-white">
                                            Edit Group
                                        </h3>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">
                                            {selectedGroup.name}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => {
                                        setShowEditModal(false)
                                        setSelectedGroup(null)
                                        setNewGroup({ name: '', description: '', color: '#3B82F6', menteeIds: [] })
                                    }}
                                    className="p-2 rounded-full hover:bg-slate-100/50 dark:hover:bg-slate-700/50 transition-colors duration-200"
                                >
                                    <Plus className="h-5 w-5 text-slate-600 dark:text-slate-400 rotate-45" />
                                </button>
                            </div>

                            <form onSubmit={handleUpdateGroup} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                        Group Name
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={newGroup.name}
                                        onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
                                        className="w-full bg-white/50 dark:bg-slate-700/50 border border-white/20 dark:border-slate-600/30 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-slate-800 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 backdrop-blur-sm"
                                        placeholder="e.g., Class 10-A Mathematics"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                        Description
                                    </label>
                                    <textarea
                                        value={newGroup.description}
                                        onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })}
                                        className="w-full bg-white/50 dark:bg-slate-700/50 border border-white/20 dark:border-slate-600/30 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-slate-800 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 backdrop-blur-sm resize-none"
                                        rows="3"
                                        placeholder="Optional description for the group"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                        Select Mentees ({newGroup.menteeIds.length} selected)
                                    </label>
                                    <div className="max-h-48 overflow-y-auto bg-white/50 dark:bg-slate-700/50 border border-white/20 dark:border-slate-600/30 rounded-2xl p-3 backdrop-blur-sm">
                                        {mentees.map((mentee) => (
                                            <label key={mentee._id} className="flex items-center space-x-3 p-3 hover:bg-white/50 dark:hover:bg-slate-600/50 rounded-xl cursor-pointer transition-colors duration-200">
                                                <input
                                                    type="checkbox"
                                                    checked={newGroup.menteeIds.includes(mentee._id)}
                                                    onChange={(e) => {
                                                        if (e.target.checked) {
                                                            setNewGroup({
                                                                ...newGroup,
                                                                menteeIds: [...newGroup.menteeIds, mentee._id]
                                                            })
                                                        } else {
                                                            setNewGroup({
                                                                ...newGroup,
                                                                menteeIds: newGroup.menteeIds.filter(id => id !== mentee._id)
                                                            })
                                                        }
                                                    }}
                                                    className="rounded-lg border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500"
                                                />
                                                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white font-bold text-sm">
                                                    {mentee.fullName?.charAt(0)}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="text-sm font-semibold text-slate-800 dark:text-white">{mentee.fullName}</div>
                                                    <div className="text-xs text-slate-500 dark:text-slate-400">{mentee.class}-{mentee.section} • {mentee.studentId}</div>
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                        Group Color
                                    </label>
                                    <div className="flex items-center space-x-3">
                                        <input
                                            type="color"
                                            value={newGroup.color}
                                            onChange={(e) => setNewGroup({ ...newGroup, color: e.target.value })}
                                            className="w-16 h-12 border-2 border-white/20 dark:border-slate-600/30 rounded-xl cursor-pointer"
                                        />
                                        <div className="flex-1 bg-white/50 dark:bg-slate-700/50 border border-white/20 dark:border-slate-600/30 rounded-2xl px-4 py-3 backdrop-blur-sm">
                                            <span className="text-sm text-slate-700 dark:text-slate-300">{newGroup.color}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex space-x-4 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowEditModal(false)
                                            setSelectedGroup(null)
                                            setNewGroup({ name: '', description: '', color: '#3B82F6', menteeIds: [] })
                                        }}
                                        className="flex-1 px-6 py-3 text-slate-700 dark:text-slate-300 bg-slate-100/50 dark:bg-slate-700/50 hover:bg-slate-200/50 dark:hover:bg-slate-600/50 rounded-2xl font-medium transition-all duration-300"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-2xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                                    >
                                        Update Group
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Group Details Modal */}
            <GroupDetailsModal
                group={selectedGroup}
                isOpen={showDetailsModal}
                onClose={() => {
                    setShowDetailsModal(false)
                    setSelectedGroup(null)
                }}
            />
        </Layout>
    )
}

export default GroupsPage