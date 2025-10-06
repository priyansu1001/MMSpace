import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import { MessageSquare, Megaphone, Plus, X } from 'lucide-react'
import GroupIcon from './icons/GroupIcon'
import UserIcon from './icons/UserIcon'
import { toast } from 'react-hot-toast'

const ChatSidebar = ({ 
    selectedConversation, 
    setSelectedConversation, 
    setConversationType, 
    activeTab, 
    setActiveTab,
    announcements,
    newAnnouncement,
    setNewAnnouncement,
    sendAnnouncement 
}) => {
    const { user, profile } = useAuth()
    const [conversations, setConversations] = useState([])
    const [loading, setLoading] = useState(true)
    const [showCreateChat, setShowCreateChat] = useState(false)

    useEffect(() => {
        fetchConversations()
    }, [user.role])

    const fetchConversations = async () => {
        try {
            let conversationList = []

            if (user.role === 'mentor') {
                // Fetch groups for mentor
                const groupsResponse = await api.get('/groups')
                const groups = groupsResponse.data.map(group => ({
                    ...group,
                    type: 'group',
                    displayName: group.name,
                    subtitle: `${group.menteeIds?.length || 0} members`
                }))
                conversationList = [...groups]

                // Add individual chats with mentees
                const menteesResponse = await api.get('/mentors/mentees')
                const individualChats = menteesResponse.data.map(mentee => {
                    const conversationId = `individual_${mentee._id}`
                    return {
                        _id: conversationId,
                        type: 'individual',
                        displayName: mentee.fullName,
                        subtitle: `${mentee.class}-${mentee.section}`,
                        menteeId: mentee._id,
                        color: '#10B981'
                    }
                })
                conversationList = [...conversationList, ...individualChats]

            } else {
                // For mentees, show groups they're part of and chat with their mentor
                try {
                    // Fetch groups for mentee
                    console.log('Fetching groups for mentee...')
                    const groupsResponse = await api.get('/groups/mentee')
                    console.log('Mentee groups response:', groupsResponse.data)
                    const groups = groupsResponse.data.map(group => ({
                        ...group,
                        type: 'group',
                        displayName: group.name,
                        subtitle: `${group.menteeIds?.length || 0} members • ${group.mentorId?.fullName || 'Mentor'}`
                    }))
                    conversationList = [...groups]
                } catch (error) {
                    console.error('Error fetching mentee groups:', error)
                    // Continue even if groups fetch fails
                }

                // Add individual chat with mentor
                if (profile?.mentorId) {
                    const mentorId = profile.mentorId._id || profile.mentorId
                    const conversationId = `individual_${profile._id}`
                    const mentorChat = {
                        _id: conversationId,
                        type: 'individual',
                        displayName: profile.mentorId.fullName || 'Your Mentor',
                        subtitle: profile.mentorId.department || 'Mentor',
                        mentorId: mentorId,
                        color: '#3B82F6'
                    }
                    conversationList = [...conversationList, mentorChat]
                }
            }

            setConversations(conversationList)
            setLoading(false)
        } catch (error) {
            console.error('Error fetching conversations:', error)
            toast.error('Failed to fetch conversations')
            setLoading(false)
        }
    }

    const renderConversationItem = (conversation, index) => (
        <div
            key={conversation._id}
            onClick={() => {
                setSelectedConversation(conversation)
                setConversationType(conversation.type)
                window.history.pushState(null, '', `/chat/${conversation._id}`)
            }}
            className={`group relative p-4 m-2 rounded-2xl cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-lg ${
                selectedConversation?._id === conversation._id
                    ? 'bg-gradient-to-r from-blue-500/20 to-indigo-500/20 dark:from-blue-400/20 dark:to-indigo-400/20 shadow-lg border border-blue-200/50 dark:border-blue-400/30'
                    : 'bg-white/50 dark:bg-slate-700/50 hover:bg-white/80 dark:hover:bg-slate-700/80 backdrop-blur-sm'
            }`}
            style={{
                animationDelay: `${index * 0.1}s`,
            }}
        >
            <div className="flex items-center space-x-3">
                <div className="relative">
                    <div
                        className="h-12 w-12 rounded-2xl flex items-center justify-center text-white font-bold shadow-lg backdrop-blur-sm"
                        style={{
                            background: `linear-gradient(135deg, ${conversation.color || '#6366F1'}dd, ${conversation.color || '#6366F1'})`
                        }}
                    >
                        {conversation.type === 'group' ? <GroupIcon className="w-6 h-6" /> : <UserIcon className="w-6 h-6" />}
                    </div>
                    <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-green-400 rounded-full border-2 border-white shadow-sm animate-pulse"></div>
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-slate-800 dark:text-white truncate">
                        {conversation.displayName}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 truncate">
                        {conversation.subtitle}
                    </p>
                </div>
                {selectedConversation?._id === conversation._id && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation()
                            setSelectedConversation(null)
                        }}
                        className="p-1 rounded-full bg-slate-200/50 dark:bg-slate-600/50 hover:bg-red-200/50 dark:hover:bg-red-500/20 transition-colors duration-200"
                    >
                        <X className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                    </button>
                )}
            </div>
        </div>
    )

    const groupConversations = conversations.filter(c => c.type === 'group')
    const individualConversations = conversations.filter(c => c.type === 'individual')

    return (
        <div className="w-80 flex flex-col bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl border-r border-white/20 dark:border-slate-700/50">
            {/* Header with Tabs */}
            <div className="p-6 bg-gradient-to-r from-white/80 to-slate-50/80 dark:from-slate-800/80 dark:to-slate-700/80 backdrop-blur-xl border-b border-white/20 dark:border-slate-700/50">
                <div className="flex items-center justify-between mb-4">
                    <h1 className="text-xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 dark:from-white dark:to-slate-200 bg-clip-text text-transparent">
                        Messages
                    </h1>
                    {user.role === 'mentor' && (
                        <button
                            onClick={() => setShowCreateChat(true)}
                            className="p-2 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-300"
                        >
                            <Plus className="h-4 w-4" />
                        </button>
                    )}
                </div>

                {/* Tab Navigation */}
                <div className="flex bg-slate-100/50 dark:bg-slate-700/50 rounded-2xl p-1 backdrop-blur-sm">
                    <button
                        onClick={() => setActiveTab('chats')}
                        className={`flex-1 flex items-center justify-center px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                            activeTab === 'chats'
                                ? 'bg-white dark:bg-slate-600 text-slate-800 dark:text-white shadow-lg transform scale-105'
                                : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
                        }`}
                    >
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Chats
                    </button>
                    {user.role === 'mentor' && (
                        <button
                            onClick={() => setActiveTab('announcements')}
                            className={`flex-1 flex items-center justify-center px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                                activeTab === 'announcements'
                                    ? 'bg-white dark:bg-slate-600 text-slate-800 dark:text-white shadow-lg transform scale-105'
                                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
                            }`}
                        >
                            <Megaphone className="h-4 w-4 mr-2" />
                            Announcements
                        </button>
                    )}
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto">
                {activeTab === 'chats' ? (
                    <div className="p-2">
                        {loading ? (
                            <div className="flex items-center justify-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                            </div>
                        ) : (
                            <>
                                {/* Groups Section */}
                                {groupConversations.length > 0 && (
                                    <div className="mb-6">
                                        <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 px-4 py-2 uppercase tracking-wide flex items-center">
                                            <GroupIcon className="w-4 h-4 mr-2" />
                                            Groups
                                        </h3>
                                        {groupConversations.map((conversation, index) => 
                                            renderConversationItem(conversation, index)
                                        )}
                                    </div>
                                )}

                                {/* Direct Messages Section */}
                                {individualConversations.length > 0 && (
                                    <div className="mb-4">
                                        <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 px-4 py-2 uppercase tracking-wide flex items-center">
                                            <UserIcon className="w-4 h-4 mr-2" />
                                            Direct Messages
                                        </h3>
                                        {individualConversations.map((conversation, index) => 
                                            renderConversationItem(conversation, index)
                                        )}
                                    </div>
                                )}

                                {/* Empty State */}
                                {conversations.length === 0 && (
                                    <div className="text-center py-8">
                                        <MessageSquare className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                                        <p className="text-sm text-slate-500 dark:text-slate-400">
                                            {user.role === 'mentor' ? 'No conversations yet' : 'No groups or conversations available'}
                                        </p>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                ) : (
                    <div className="p-4">
                        <div className="space-y-4">
                            {/* Announcement Input */}
                            <div className="bg-white/50 dark:bg-slate-700/50 backdrop-blur-sm rounded-2xl p-4">
                                <h3 className="font-semibold text-slate-800 dark:text-white mb-3">
                                    Create Announcement
                                </h3>
                                <textarea
                                    value={newAnnouncement}
                                    onChange={(e) => setNewAnnouncement(e.target.value)}
                                    placeholder="Type your announcement..."
                                    className="w-full bg-white/50 dark:bg-slate-600/50 border border-white/20 dark:border-slate-600/30 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-slate-800 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 resize-none"
                                    rows="3"
                                />
                                <button
                                    onClick={sendAnnouncement}
                                    disabled={!newAnnouncement.trim()}
                                    className="mt-3 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all duration-300"
                                >
                                    Send Announcement
                                </button>
                            </div>

                            {/* Recent Announcements */}
                            <div className="space-y-3">
                                <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 px-2">
                                    Recent Announcements
                                </h3>
                                {announcements.length > 0 ? (
                                    announcements.map((announcement, index) => (
                                        <div
                                            key={announcement._id}
                                            className="bg-white/50 dark:bg-slate-700/50 backdrop-blur-sm rounded-2xl p-4 border border-white/20 dark:border-slate-600/30 hover:shadow-lg transition-all duration-300"
                                            style={{ animationDelay: `${index * 0.1}s` }}
                                        >
                                            <div className="flex items-start space-x-3">
                                                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white font-bold shadow-lg">
                                                    📢
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-semibold text-slate-800 dark:text-white text-sm">
                                                        {announcement.title}
                                                    </h4>
                                                    <p className="text-sm text-slate-600 dark:text-slate-300 mt-1 line-clamp-2">
                                                        {announcement.content}
                                                    </p>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                                                        {new Date(announcement.createdAt).toLocaleDateString()}
                                                    </p>
                                                </div>
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                    announcement.priority === 'urgent' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                                                    announcement.priority === 'high' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' :
                                                    announcement.priority === 'medium' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                                                    'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                                                }`}>
                                                    {announcement.priority}
                                                </span>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-8">
                                        <Megaphone className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                                        <p className="text-sm text-slate-500 dark:text-slate-400">
                                            No announcements yet
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Create Chat Modal */}
            {showCreateChat && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl rounded-3xl p-6 max-w-md w-full mx-4 shadow-2xl border border-white/20 dark:border-slate-700/50">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-slate-800 dark:text-white">Create New Chat</h3>
                            <button
                                onClick={() => setShowCreateChat(false)}
                                className="p-2 rounded-full hover:bg-slate-100/50 dark:hover:bg-slate-700/50 transition-colors duration-200"
                            >
                                <X className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                            </button>
                        </div>
                        <p className="text-slate-600 dark:text-slate-400 text-sm">
                            Feature coming soon! You'll be able to create new group chats and invite mentees.
                        </p>
                    </div>
                </div>
            )}
        </div>
    )
}

export default ChatSidebar
