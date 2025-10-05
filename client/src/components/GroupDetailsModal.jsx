import { useState, useEffect } from 'react'
import { X, Users, Calendar, User, Mail, Phone, MapPin } from 'lucide-react'
import api from '../services/api'
import LoadingSpinner from './LoadingSpinner'

const GroupDetailsModal = ({ group, isOpen, onClose }) => {
    const [groupDetails, setGroupDetails] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (isOpen && group) {
            fetchGroupDetails()
        }
    }, [isOpen, group])

    const fetchGroupDetails = async () => {
        try {
            setLoading(true)
            const response = await api.get(`/groups/${group._id}/details`)
            setGroupDetails(response.data)
        } catch (error) {
            console.error('Error fetching group details:', error)
        } finally {
            setLoading(false)
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
            <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 dark:border-slate-700/50 w-full max-w-4xl max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="p-6 border-b border-white/20 dark:border-slate-700/50">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div
                                className="h-16 w-16 rounded-2xl flex items-center justify-center shadow-lg"
                                style={{
                                    background: `linear-gradient(135deg, ${group?.color}dd, ${group?.color})`
                                }}
                            >
                                <Users className="h-8 w-8 text-white" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
                                    {group?.name}
                                </h2>
                                <p className="text-slate-600 dark:text-slate-400">
                                    {group?.description || 'No description provided'}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-full hover:bg-slate-100/50 dark:hover:bg-slate-700/50 transition-colors duration-200"
                        >
                            <X className="h-6 w-6 text-slate-600 dark:text-slate-400" />
                        </button>
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
                            {/* Group Stats */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="bg-white/50 dark:bg-slate-700/50 backdrop-blur-sm rounded-2xl p-4">
                                    <div className="flex items-center space-x-3">
                                        <div className="h-10 w-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                                            <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                        </div>
                                        <div>
                                            <p className="text-2xl font-bold text-slate-800 dark:text-white">
                                                {groupDetails?.members?.length || 0}
                                            </p>
                                            <p className="text-sm text-slate-600 dark:text-slate-400">Members</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white/50 dark:bg-slate-700/50 backdrop-blur-sm rounded-2xl p-4">
                                    <div className="flex items-center space-x-3">
                                        <div className="h-10 w-10 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                                            <Calendar className="h-5 w-5 text-green-600 dark:text-green-400" />
                                        </div>
                                        <div>
                                            <p className="text-2xl font-bold text-slate-800 dark:text-white">
                                                {new Date(group?.createdAt).toLocaleDateString()}
                                            </p>
                                            <p className="text-sm text-slate-600 dark:text-slate-400">Created</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white/50 dark:bg-slate-700/50 backdrop-blur-sm rounded-2xl p-4">
                                    <div className="flex items-center space-x-3">
                                        <div className="h-10 w-10 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
                                            <User className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                                        </div>
                                        <div>
                                            <p className="text-2xl font-bold text-slate-800 dark:text-white">
                                                {groupDetails?.mentor?.fullName?.split(' ')[0] || 'N/A'}
                                            </p>
                                            <p className="text-sm text-slate-600 dark:text-slate-400">Mentor</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Members List */}
                            <div className="bg-white/50 dark:bg-slate-700/50 backdrop-blur-sm rounded-2xl p-6">
                                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center">
                                    <Users className="h-5 w-5 mr-2" />
                                    Group Members ({groupDetails?.members?.length || 0})
                                </h3>

                                {groupDetails?.members?.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {groupDetails.members.map((member) => (
                                            <div
                                                key={member._id}
                                                className="bg-white/50 dark:bg-slate-600/50 rounded-xl p-4 hover:bg-white/70 dark:hover:bg-slate-600/70 transition-colors duration-200"
                                            >
                                                <div className="flex items-center space-x-3">
                                                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white font-bold">
                                                        {member.fullName?.charAt(0)}
                                                    </div>
                                                    <div className="flex-1">
                                                        <h4 className="font-semibold text-slate-800 dark:text-white">
                                                            {member.fullName}
                                                        </h4>
                                                        <div className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                                                            <p className="flex items-center">
                                                                <User className="h-3 w-3 mr-1" />
                                                                {member.studentId}
                                                            </p>
                                                            <p className="flex items-center">
                                                                <Mail className="h-3 w-3 mr-1" />
                                                                {member.email}
                                                            </p>
                                                            {member.class && member.section && (
                                                                <p className="flex items-center">
                                                                    <MapPin className="h-3 w-3 mr-1" />
                                                                    Class {member.class}-{member.section}
                                                                </p>
                                                            )}
                                                            {member.phone && (
                                                                <p className="flex items-center">
                                                                    <Phone className="h-3 w-3 mr-1" />
                                                                    {member.phone}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <Users className="h-12 w-12 text-slate-400 dark:text-slate-500 mx-auto mb-3" />
                                        <p className="text-slate-600 dark:text-slate-400">No members in this group yet</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default GroupDetailsModal