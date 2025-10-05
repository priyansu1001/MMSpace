import { useState, useEffect } from 'react'
import { X, Calendar, Check, X as XIcon, Save, ChevronLeft, ChevronRight, Users, TrendingUp } from 'lucide-react'
import api from '../services/api'
import LoadingSpinner from './LoadingSpinner'
import { toast } from 'react-hot-toast'

const AttendanceManagementModal = ({ isOpen, onClose }) => {
    const [students, setStudents] = useState([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth())
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
    const [attendanceData, setAttendanceData] = useState({})
    const [monthlyView, setMonthlyView] = useState(false)

    useEffect(() => {
        if (isOpen) {
            fetchStudents()
            fetchAttendanceData()
        }
    }, [isOpen, selectedDate, selectedMonth, selectedYear])

    const fetchStudents = async () => {
        try {
            setLoading(true)
            const response = await api.get('/admin/mentees')
            setStudents(response.data)
        } catch (error) {
            console.error('Error fetching students:', error)
            toast.error('Failed to fetch students')
        } finally {
            setLoading(false)
        }
    }

    const fetchAttendanceData = async () => {
        try {
            const response = await api.get(`/admin/attendance`, {
                params: {
                    date: selectedDate,
                    month: selectedMonth + 1,
                    year: selectedYear
                }
            })
            setAttendanceData(response.data)
        } catch (error) {
            console.error('Error fetching attendance data:', error)
        }
    }

    const handleAttendanceChange = (studentId, date, status) => {
        setAttendanceData(prev => ({
            ...prev,
            [studentId]: {
                ...prev[studentId],
                [date]: status
            }
        }))
    }

    const saveAttendance = async () => {
        try {
            setSaving(true)
            await api.post('/admin/attendance', {
                date: selectedDate,
                attendanceData
            })
            toast.success('Attendance saved successfully')
        } catch (error) {
            console.error('Error saving attendance:', error)
            toast.error('Failed to save attendance')
        } finally {
            setSaving(false)
        }
    }

    const getDaysInMonth = (month, year) => {
        return new Date(year, month + 1, 0).getDate()
    }

    const getMonthName = (month) => {
        const months = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ]
        return months[month]
    }

    const calculateMonthlyAttendance = (studentId) => {
        const studentAttendance = attendanceData[studentId] || {}
        const daysInMonth = getDaysInMonth(selectedMonth, selectedYear)
        let presentDays = 0
        let totalDays = 0

        for (let day = 1; day <= daysInMonth; day++) {
            const date = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
            if (studentAttendance[date] !== undefined) {
                totalDays++
                if (studentAttendance[date] === 'present') {
                    presentDays++
                }
            }
        }

        return { presentDays, totalDays, percentage: totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0 }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
            <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 dark:border-slate-700/50 w-full max-w-7xl max-h-[95vh] overflow-hidden">
                {/* Header */}
                <div className="p-6 border-b border-white/20 dark:border-slate-700/50 bg-gradient-to-r from-blue-500/10 to-indigo-500/10">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="h-16 w-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                                <Calendar className="h-8 w-8 text-white" />
                            </div>
                            <div>
                                <h2 className="text-3xl font-bold text-slate-800 dark:text-white">
                                    Attendance Management
                                </h2>
                                <p className="text-slate-600 dark:text-slate-400">
                                    Manage daily attendance for all students
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={() => setMonthlyView(!monthlyView)}
                                className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 ${monthlyView
                                        ? 'bg-blue-500 text-white shadow-lg'
                                        : 'bg-white/50 dark:bg-slate-700/50 text-slate-700 dark:text-slate-300'
                                    }`}
                            >
                                {monthlyView ? 'Daily View' : 'Monthly View'}
                            </button>
                            <button
                                onClick={onClose}
                                className="p-3 rounded-full hover:bg-slate-100/50 dark:hover:bg-slate-700/50 transition-colors duration-200"
                            >
                                <X className="h-6 w-6 text-slate-600 dark:text-slate-400" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Controls */}
                <div className="p-6 border-b border-white/20 dark:border-slate-700/50">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            {!monthlyView ? (
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                        Select Date
                                    </label>
                                    <input
                                        type="date"
                                        value={selectedDate}
                                        onChange={(e) => setSelectedDate(e.target.value)}
                                        className="bg-white/50 dark:bg-slate-700/50 border border-white/20 dark:border-slate-600/30 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-slate-800 dark:text-white"
                                    />
                                </div>
                            ) : (
                                <div className="flex items-center space-x-4">
                                    <button
                                        onClick={() => {
                                            if (selectedMonth === 0) {
                                                setSelectedMonth(11)
                                                setSelectedYear(selectedYear - 1)
                                            } else {
                                                setSelectedMonth(selectedMonth - 1)
                                            }
                                        }}
                                        className="p-2 rounded-full bg-white/50 dark:bg-slate-700/50 hover:bg-white/80 dark:hover:bg-slate-600/50 transition-colors"
                                    >
                                        <ChevronLeft className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                                    </button>
                                    <div className="text-xl font-bold text-slate-800 dark:text-white">
                                        {getMonthName(selectedMonth)} {selectedYear}
                                    </div>
                                    <button
                                        onClick={() => {
                                            if (selectedMonth === 11) {
                                                setSelectedMonth(0)
                                                setSelectedYear(selectedYear + 1)
                                            } else {
                                                setSelectedMonth(selectedMonth + 1)
                                            }
                                        }}
                                        className="p-2 rounded-full bg-white/50 dark:bg-slate-700/50 hover:bg-white/80 dark:hover:bg-slate-600/50 transition-colors"
                                    >
                                        <ChevronRight className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                                    </button>
                                </div>
                            )}
                        </div>
                        {!monthlyView && (
                            <button
                                onClick={saveAttendance}
                                disabled={saving}
                                className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-2 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 flex items-center"
                            >
                                {saving ? <LoadingSpinner size="sm" /> : <Save className="h-4 w-4 mr-2" />}
                                Save Attendance
                            </button>
                        )}
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-[calc(95vh-200px)]">
                    {loading ? (
                        <div className="flex items-center justify-center h-64">
                            <LoadingSpinner />
                        </div>
                    ) : (
                        <div>
                            {!monthlyView ? (
                                /* Daily View */
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {students.map((student, index) => {
                                        const currentAttendance = attendanceData[student._id]?.[selectedDate]
                                        return (
                                            <div
                                                key={student._id}
                                                className="bg-white/70 dark:bg-slate-700/70 backdrop-blur-sm rounded-2xl p-4 border border-white/20 dark:border-slate-600/30 hover:shadow-lg transition-all duration-300 message-bubble"
                                                style={{ animationDelay: `${index * 0.05}s` }}
                                            >
                                                <div className="flex items-center space-x-3 mb-4">
                                                    <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white font-bold">
                                                        {student.fullName?.charAt(0)}
                                                    </div>
                                                    <div className="flex-1">
                                                        <h3 className="font-semibold text-slate-800 dark:text-white">
                                                            {student.fullName}
                                                        </h3>
                                                        <p className="text-sm text-slate-600 dark:text-slate-400">
                                                            {student.studentId} • Class {student.class}-{student.section}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex space-x-2">
                                                    <button
                                                        onClick={() => handleAttendanceChange(student._id, selectedDate, 'present')}
                                                        className={`flex-1 py-2 px-4 rounded-xl font-medium transition-all duration-300 flex items-center justify-center ${currentAttendance === 'present'
                                                                ? 'bg-green-500 text-white shadow-lg'
                                                                : 'bg-white/50 dark:bg-slate-600/50 text-slate-700 dark:text-slate-300 hover:bg-green-100 dark:hover:bg-green-900/30'
                                                            }`}
                                                    >
                                                        <Check className="h-4 w-4 mr-1" />
                                                        Present
                                                    </button>
                                                    <button
                                                        onClick={() => handleAttendanceChange(student._id, selectedDate, 'absent')}
                                                        className={`flex-1 py-2 px-4 rounded-xl font-medium transition-all duration-300 flex items-center justify-center ${currentAttendance === 'absent'
                                                                ? 'bg-red-500 text-white shadow-lg'
                                                                : 'bg-white/50 dark:bg-slate-600/50 text-slate-700 dark:text-slate-300 hover:bg-red-100 dark:hover:bg-red-900/30'
                                                            }`}
                                                    >
                                                        <XIcon className="h-4 w-4 mr-1" />
                                                        Absent
                                                    </button>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            ) : (
                                /* Monthly View */
                                <div className="space-y-4">
                                    {students.map((student, index) => {
                                        const monthlyStats = calculateMonthlyAttendance(student._id)
                                        const daysInMonth = getDaysInMonth(selectedMonth, selectedYear)

                                        return (
                                            <div
                                                key={student._id}
                                                className="bg-white/70 dark:bg-slate-700/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20 dark:border-slate-600/30 hover:shadow-lg transition-all duration-300 message-bubble"
                                                style={{ animationDelay: `${index * 0.05}s` }}
                                            >
                                                <div className="flex items-center justify-between mb-4">
                                                    <div className="flex items-center space-x-4">
                                                        <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white font-bold">
                                                            {student.fullName?.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <h3 className="font-semibold text-slate-800 dark:text-white">
                                                                {student.fullName}
                                                            </h3>
                                                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                                                {student.studentId} • Class {student.class}-{student.section}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className={`text-2xl font-bold ${monthlyStats.percentage >= 90 ? 'text-green-600' :
                                                                monthlyStats.percentage >= 75 ? 'text-yellow-600' : 'text-red-600'
                                                            }`}>
                                                            {monthlyStats.percentage}%
                                                        </div>
                                                        <p className="text-sm text-slate-600 dark:text-slate-400">
                                                            {monthlyStats.presentDays}/{monthlyStats.totalDays} days
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Monthly Calendar Grid */}
                                                <div className="grid grid-cols-7 gap-1 mb-4">
                                                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(day => (
                                                        <div key={day} className="text-center text-xs font-medium text-slate-500 dark:text-slate-400 p-2">
                                                            {day}
                                                        </div>
                                                    ))}
                                                    {Array.from({ length: daysInMonth }, (_, i) => {
                                                        const day = i + 1
                                                        const date = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
                                                        const attendance = attendanceData[student._id]?.[date]

                                                        return (
                                                            <div
                                                                key={day}
                                                                className={`text-center text-xs p-2 rounded ${attendance === 'present' ? 'bg-green-500 text-white' :
                                                                        attendance === 'absent' ? 'bg-red-500 text-white' :
                                                                            'bg-slate-200 dark:bg-slate-600 text-slate-600 dark:text-slate-400'
                                                                    }`}
                                                            >
                                                                {day}
                                                            </div>
                                                        )
                                                    })}
                                                </div>

                                                {/* Progress Bar */}
                                                <div className="w-full bg-slate-200 dark:bg-slate-600 rounded-full h-2">
                                                    <div
                                                        className={`h-2 rounded-full transition-all duration-500 ${monthlyStats.percentage >= 90 ? 'bg-gradient-to-r from-green-500 to-green-400' :
                                                                monthlyStats.percentage >= 75 ? 'bg-gradient-to-r from-yellow-500 to-yellow-400' :
                                                                    'bg-gradient-to-r from-red-500 to-red-400'
                                                            }`}
                                                        style={{ width: `${monthlyStats.percentage}%` }}
                                                    />
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default AttendanceManagementModal