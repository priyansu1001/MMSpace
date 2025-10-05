import { useState, useEffect } from 'react'
import { X, User, Mail, Phone, MapPin, Calendar, TrendingUp, BookOpen, Clock } from 'lucide-react'
import api from '../services/api'
import LoadingSpinner from './LoadingSpinner'

const StudentDetailsModal = ({ student, isOpen, onClose }) => {
    const [studentDetails, setStudentDetails] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (isOpen && student) {
            fetchStudentDetails()
        }
    }, [isOpen, student])

    const fetchStudentDetails = async () => {
        try {
            setLoading(true)
            const response = await api.get(`/mentees/${student._id}/details`)
            setStudentDetails(response.data)
        } catch (error) {
            console.error('Error fetching student details:', error)
            // Fallback to the student data passed as prop
            setStudentDetails(student)
        } finally {
            setLoading(false)
        }
    }

    // Generate attendance data for the last 12 months
    const generateAttendanceData = () => {
        const months = [
            'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
            'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
        ]

        // Use actual data if available, otherwise generate sample data
        const attendanceData = studentDetails?.attendanceHistory || months.map((month, index) => ({
            month,
            percentage: Math.floor(Math.random() * 30) + 70 // Random between 70-100%
        }))

        return attendanceData.slice(-12) // Last 12 months
    }

    const AttendanceBarChart = ({ data }) => {
        const maxPercentage = 100

        return (
            <div className="bg-white/50 dark:bg-slate-700/50 backdrop-blur-sm rounded-2xl p-6">
                <h4 className="text-lg font-semibold text-slate-800 dark:text-white mb-4 flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2" />
                    Monthly Attendance
                </h4>
                <div className="flex items-end justify-between h-48 space-x-2">
                    {data.map((item, index) => (
                        <div key={index} className="flex flex-col items-center flex-1">
                            <div className="relative w-full bg-slate-200 dark:bg-slate-600 rounded-t-lg overflow-hidden" style={{ height: '160px' }}>
                                <div
                                    className={`absolute bottom-0 w-full rounded-t-lg transition-all duration-500 ${item.percentage >= 90
                                            ? 'bg-gradient-to-t from-green-500 to-green-400'
                                            : item.percentage >= 75
                                                ? 'bg-gradient-to-t from-yellow-500 to-yellow-400'
                                                : 'bg-gradient-to-t from-red-500 to-red-400'
                                        }`}
                                    style={{
                                        height: `${(item.percentage / maxPercentage) * 160}px`,
                                        animationDelay: `${index * 0.1}s`
                                    }}
                                >
                                    <div className="absolute inset-0 bg-white/20"></div>
                                </div>
                                <div className="absolute top-1 left-1/2 transform -translate-x-1/2 text-xs font-semibold text-white">
                                    {item.percentage}%
                                </div>
                            </div>
                            <span className="text-xs text-slate-600 dark:text-slate-400 mt-2 font-medium">
                                {item.month}
                            </span>
                        </div>
                    ))}
                </div>
                <div className="flex justify-center mt-4 space-x-4 text-xs">
                    <div className="flex items-center">
                        <div className="w-3 h-3 bg-green-500 rounded mr-1"></div>
                        <span className="text-slate-600 dark:text-slate-400">Excellent (90%+)</span>
                    </div>
                    <div className="flex items-center">
                        <div className="w-3 h-3 bg-yellow-500 rounded mr-1"></div>
                        <span className="text-slate-600 dark:text-slate-400">Good (75-89%)</span>
                    </div>
                    <div className="flex items-center">
                        <div className="w-3 h-3 bg-red-500 rounded mr-1"></div>
                        <span className="text-slate-600 dark:text-slate-400">Needs Improvement (&lt;75%)</span>
                    </div>
                </div>
            </div>
        )
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
            <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 dark:border-slate-700/50 w-full max-w-4xl max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="p-6 border-b border-white/20 dark:border-slate-700/50">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg">
                                <span className="text-2xl font-bold text-white">
                                    {student?.fullName?.charAt(0) || 'S'}
                                </span>
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
                                    {student?.fullName || 'Student Details'}
                                </h2>
                                <p className="text-slate-600 dark:text-slate-400">
                                    Student ID: {student?.studentId}
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
                            {/* Student Info Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <div className="bg-white/50 dark:bg-slate-700/50 backdrop-blur-sm rounded-2xl p-4">
                                    <div className="flex items-center space-x-3">
                                        <div className="h-10 w-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                                            <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-slate-600 dark:text-slate-400">Class</p>
                                            <p className="text-lg font-bold text-slate-800 dark:text-white">
                                                {student?.class}-{student?.section}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white/50 dark:bg-slate-700/50 backdrop-blur-sm rounded-2xl p-4">
                                    <div className="flex items-center space-x-3">
                                        <div className="h-10 w-10 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                                            <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-slate-600 dark:text-slate-400">Attendance</p>
                                            <p className="text-lg font-bold text-slate-800 dark:text-white">
                                                {student?.attendance?.percentage || 0}%
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white/50 dark:bg-slate-700/50 backdrop-blur-sm rounded-2xl p-4">
                                    <div className="flex items-center space-x-3">
                                        <div className="h-10 w-10 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
                                            <Calendar className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-slate-600 dark:text-slate-400">Present Days</p>
                                            <p className="text-lg font-bold text-slate-800 dark:text-white">
                                                {student?.attendance?.presentDays || 0}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white/50 dark:bg-slate-700/50 backdrop-blur-sm rounded-2xl p-4">
                                    <div className="flex items-center space-x-3">
                                        <div className="h-10 w-10 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center">
                                            <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-slate-600 dark:text-slate-400">Total Days</p>
                                            <p className="text-lg font-bold text-slate-800 dark:text-white">
                                                {student?.attendance?.totalDays || 0}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Contact Information */}
                            <div className="bg-white/50 dark:bg-slate-700/50 backdrop-blur-sm rounded-2xl p-6">
                                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center">
                                    <User className="h-5 w-5 mr-2" />
                                    Contact Information
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="flex items-center space-x-3">
                                        <Mail className="h-4 w-4 text-slate-500" />
                                        <div>
                                            <p className="text-sm text-slate-600 dark:text-slate-400">Email</p>
                                            <p className="text-slate-800 dark:text-white font-medium">
                                                {student?.userId?.email || 'N/A'}
                                            </p>
                                        </div>
                                    </div>
                                    {student?.phone && (
                                        <div className="flex items-center space-x-3">
                                            <Phone className="h-4 w-4 text-slate-500" />
                                            <div>
                                                <p className="text-sm text-slate-600 dark:text-slate-400">Phone</p>
                                                <p className="text-slate-800 dark:text-white font-medium">
                                                    {student.phone}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                    {student?.address && (
                                        <div className="flex items-center space-x-3">
                                            <MapPin className="h-4 w-4 text-slate-500" />
                                            <div>
                                                <p className="text-sm text-slate-600 dark:text-slate-400">Address</p>
                                                <p className="text-slate-800 dark:text-white font-medium">
                                                    {student.address}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                    <div className="flex items-center space-x-3">
                                        <Calendar className="h-4 w-4 text-slate-500" />
                                        <div>
                                            <p className="text-sm text-slate-600 dark:text-slate-400">Last Login</p>
                                            <p className="text-slate-800 dark:text-white font-medium">
                                                {student?.userId?.lastLogin
                                                    ? new Date(student.userId.lastLogin).toLocaleDateString()
                                                    : 'Never'
                                                }
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Attendance Bar Chart */}
                            <AttendanceBarChart data={generateAttendanceData()} />
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default StudentDetailsModal