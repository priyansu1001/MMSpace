import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { toast } from 'react-hot-toast';
import {
    Megaphone,
    Edit2,
    Trash2,
    Calendar,
    AlertTriangle,
    X,
    Check,
    ChevronLeft,
    Send
} from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';

const AnnouncementHistory = ({ selectedAnnouncement, onClose }) => {
    const { user } = useAuth();
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingAnnouncement, setEditingAnnouncement] = useState(null);
    const [editForm, setEditForm] = useState({ title: '', content: '', priority: 'medium' });
    const [confirmDelete, setConfirmDelete] = useState(null);

    useEffect(() => {
        fetchAnnouncements();
    }, []);

    const sortAnnouncements = (items) => [...items].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const fetchAnnouncements = async () => {
        try {
            setLoading(true);
            const response = await api.get('/announcements');
            const fetched = response.data.announcements || [];
            setAnnouncements(sortAnnouncements(fetched));
        } catch (error) {
            console.error('Error fetching announcements:', error);
            toast.error('Failed to fetch announcements');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (announcement) => {
        setEditingAnnouncement(announcement._id);
        setEditForm({
            title: announcement.title,
            content: announcement.content,
            priority: announcement.priority
        });
    };

    const handleUpdate = async (announcementId) => {
        try {
            // Using PATCH to update only the fields that changed
            const response = await api.patch(`/announcements/${announcementId}`, editForm);

            const updatedAnnouncement = response.data?.announcement || null;

            // Update local state
            setAnnouncements(prev => {
                const updated = prev.map(ann => 
                    ann._id === announcementId
                        ? { ...ann, ...editForm, ...(updatedAnnouncement || {}) }
                        : ann
                );
                return sortAnnouncements(updated);
            });

            setEditingAnnouncement(null);
            toast.success('Announcement updated successfully!');
        } catch (error) {
            console.error('Error updating announcement:', error);
            toast.error('Failed to update announcement');
        }
    };

    const handleDelete = async (announcementId) => {
        try {
            await api.delete(`/announcements/${announcementId}`);
            
            // Update local state by removing the announcement
            setAnnouncements(prev => prev.filter(ann => ann._id !== announcementId));
            setConfirmDelete(null);
            toast.success('Announcement deleted successfully!');
        } catch (error) {
            console.error('Error deleting announcement:', error);
            toast.error('Failed to delete announcement');
        }
    };

    const cancelEdit = () => {
        setEditingAnnouncement(null);
    };

    const getPriorityBadge = (priority) => {
        switch(priority) {
            case 'urgent': 
                return <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">Urgent</span>;
            case 'high':
                return <span className="px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">High</span>;
            case 'medium':
                return <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">Medium</span>;
            default:
                return <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">Low</span>;
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <LoadingSpinner />
            </div>
        );
    }

    // Show a specific announcement if one is selected
    const displayAnnouncements = selectedAnnouncement && selectedAnnouncement._id && selectedAnnouncement._id !== 'all'
        ? announcements.filter(a => a._id === selectedAnnouncement._id)
        : announcements;

    return (
        <div className="h-full flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
                <div className="flex items-center space-x-3">
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700">
                        <ChevronLeft className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                    </button>
                    <h2 className="text-xl font-bold text-slate-800 dark:text-white">
                        {selectedAnnouncement ? 'Announcement Details' : 'Announcements History'}
                    </h2>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
                {displayAnnouncements.length === 0 ? (
                    <div className="text-center py-12">
                        <Megaphone className="h-16 w-16 text-slate-400 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-300 mb-2">
                            No Announcements
                        </h3>
                        <p className="text-slate-500 dark:text-slate-400">
                            There are no announcements to display.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {displayAnnouncements.map(announcement => (
                            <div 
                                key={announcement._id} 
                                className="bg-white dark:bg-slate-800 rounded-xl shadow-md overflow-hidden border border-slate-200 dark:border-slate-700"
                            >
                                {editingAnnouncement === announcement._id ? (
                                    <div className="p-6">
                                        <div className="mb-4">
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                                Title
                                            </label>
                                            <input
                                                type="text"
                                                value={editForm.title}
                                                onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                                                className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
                                            />
                                        </div>
                                        <div className="mb-4">
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                                Content
                                            </label>
                                            <textarea
                                                value={editForm.content}
                                                onChange={(e) => setEditForm({...editForm, content: e.target.value})}
                                                rows={5}
                                                className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
                                            />
                                        </div>
                                        <div className="mb-4">
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                                Priority
                                            </label>
                                            <select
                                                value={editForm.priority}
                                                onChange={(e) => setEditForm({...editForm, priority: e.target.value})}
                                                className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
                                            >
                                                <option value="low">Low</option>
                                                <option value="medium">Medium</option>
                                                <option value="high">High</option>
                                                <option value="urgent">Urgent</option>
                                            </select>
                                        </div>
                                        <div className="flex justify-end space-x-3 mt-4">
                                            <button
                                                onClick={cancelEdit}
                                                className="px-4 py-2 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={() => handleUpdate(announcement._id)}
                                                className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                                            >
                                                Save Changes
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <div className="p-6">
                                            <div className="flex justify-between items-start">
                                                <h3 className="text-lg font-semibold text-slate-800 dark:text-white">
                                                    {announcement.title}
                                                </h3>
                                                {getPriorityBadge(announcement.priority)}
                                            </div>
                                            
                                            <div className="flex items-center text-sm text-slate-500 dark:text-slate-400 mt-2 mb-4">
                                                <Calendar className="h-4 w-4 mr-1" />
                                                {formatDate(announcement.createdAt)}
                                                {announcement.updatedAt !== announcement.createdAt && (
                                                    <span className="ml-2 italic">(Edited)</span>
                                                )}
                                            </div>
                                            
                                            <div className="prose prose-slate dark:prose-invert max-w-none">
                                                <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                                                    {announcement.content}
                                                </p>
                                            </div>

                                            {/* Show author info */}
                                            <div className="mt-4 flex items-center text-sm text-slate-500 dark:text-slate-400">
                                                Posted by: {announcement.authorId?.email || 'Unknown'}
                                            </div>
                                        </div>

                                        {/* Show edit/delete buttons only for mentors and if they're the author */}
                                        {user && (user.role === 'mentor' || user.role === 'admin') && 
                                          user.id === announcement.authorId?._id && (
                                            <div className="px-6 py-3 bg-slate-50 dark:bg-slate-700/50 border-t border-slate-200 dark:border-slate-700 flex justify-end space-x-2">
                                                {confirmDelete === announcement._id ? (
                                                    <div className="flex items-center space-x-2">
                                                        <span className="text-sm text-red-600 dark:text-red-400">Confirm delete?</span>
                                                        <button 
                                                            onClick={() => setConfirmDelete(null)}
                                                            className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-600"
                                                        >
                                                            <X className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                                                        </button>
                                                        <button 
                                                            onClick={() => handleDelete(announcement._id)}
                                                            className="p-2 rounded-full hover:bg-red-100 dark:hover:bg-red-900/30"
                                                        >
                                                            <Check className="h-4 w-4 text-red-600 dark:text-red-400" />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <button 
                                                            onClick={() => handleEdit(announcement)}
                                                            className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-600"
                                                            title="Edit announcement"
                                                        >
                                                            <Edit2 className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                                                        </button>
                                                        <button 
                                                            onClick={() => setConfirmDelete(announcement._id)}
                                                            className="p-2 rounded-full hover:bg-red-100 dark:hover:bg-red-900/30"
                                                            title="Delete announcement"
                                                        >
                                                            <Trash2 className="h-4 w-4 text-red-600 dark:text-red-400" />
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AnnouncementHistory;