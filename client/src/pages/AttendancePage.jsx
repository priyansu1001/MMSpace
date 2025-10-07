import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import Layout from '../components/Layout'
import LoadingSpinner from '../components/LoadingSpinner'
import AttendanceDetailsModal from '../components/AttendanceDetailsModal'
import api from '../services/api'
import { Users, UserCheck, UserX, BarChart3 } from 'lucide-react'

const AttendancePage = () => {
    const { user } = useAuth()
    const [groups, setGroups] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [selectedGroup, setSelectedGroup] = useState(null)
    const [showDetails, setShowDetails] = useState(false)

    useEffect(() => {
        if (!user) return
        const fetchData = async () => {
            try {
                setLoading(true)
                setError('')

                const endpoint = user.role === 'mentor'
                    ? '/groups'
                    : user.role === 'admin'
                        ? '/admin/groups'
                        : null

                if (!endpoint) {
                    setGroups([])
                    setError('Attendance view is only available for mentors (and admins).')
                    return
                }

                const response = await api.get(endpoint)
                const fetchedGroups = Array.isArray(response.data) ? response.data : []

                // When groups lack mentees, generate mock mentees to exercise UI
                const groupsWithMockedMentees = fetchedGroups.map((group, index) => {
                    const mentees = group.menteeIds || group.mentees
                    if (Array.isArray(mentees) && mentees.length >= 10) {
                        return group
                    }

                    const randomCount = Math.floor(Math.random() * 11) + 10 // 10-20 mentees
                    const mockMentees = Array.from({ length: randomCount }).map((_, idx) => {
                        const totalDays = Math.floor(Math.random() * 20) + 20
                        const presentDays = Math.min(totalDays, Math.floor(totalDays * (0.6 + Math.random() * 0.4)))
                        const percentage = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0

                        const studentIndex = idx + 1
                        return {
                            _id: `${group._id || index}-mock-${studentIndex}`,
                            fullName: `Student ${studentIndex}`,
                            studentId: `MT-${String(studentIndex).padStart(3, '0')}`,
                            class: 'CSE',
                            section: ['A', 'B', 'C'][studentIndex % 3],
                            attendance: {
                                totalDays,
                                presentDays,
                                percentage
                            }
                        }
                    })

                    return {
                        ...group,
                        menteeIds: mockMentees
                    }
                })

                setGroups(groupsWithMockedMentees)
            } catch (err) {
                console.error('Error fetching attendance groups:', err)
                setError('Unable to load attendance information right now. Please try again later.')
                setGroups([])
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [user])

    const preparedGroups = useMemo(() => {
        return groups.map((group) => {
            const mentees = group.menteeIds || group.mentees || []
            const totals = mentees.reduce((acc, mentee) => {
                const attendance = mentee.attendance || {}
                const present = attendance.presentDays || 0
                const total = attendance.totalDays || 0
                const absent = Math.max(total - present, 0)

                acc.students += 1
                acc.present += present
                acc.totalDays += total
                acc.absent += absent
                return acc
            }, { students: 0, present: 0, absent: 0, totalDays: 0 })

            const averagePercentage = totals.students > 0
                ? Math.round(
                    mentees.reduce((sum, mentee) => sum + (mentee.attendance?.percentage || 0), 0) /
                    totals.students
                )
                : 0

            return {
                id: group._id,
                name: group.name,
                description: group.description,
                color: group.color || '#3B82F6',
                mentees,
                stats: {
                    totalStudents: totals.students,
                    presentDays: totals.present,
                    totalDays: totals.totalDays,
                    absentDays: totals.absent,
                    averagePercentage
                }
            }
        })
    }, [groups])

    const handleDetailsOpen = (group) => {
        setSelectedGroup({
            ...group,
            mentees: group.mentees
        })
        setShowDetails(true)
    }

    const renderContent = () => {
        if (!user) {
            return (
                <div className="flex h-64 items-center justify-center">
                    <LoadingSpinner />
                </div>
            )
        }

        if (loading) {
            return (
                <div className="flex h-64 items-center justify-center">
                    <LoadingSpinner />
                </div>
            )
        }

        if (error) {
            return (
                <div className="rounded-3xl border border-red-200/40 bg-red-50/70 px-6 py-16 text-center text-red-600 shadow-lg dark:border-red-900/30 dark:bg-red-950/40 dark:text-red-300">
                    {error}
                </div>
            )
        }

        if (preparedGroups.length === 0) {
            return (
                <div className="rounded-3xl border border-white/20 bg-white/70 px-6 py-16 text-center shadow-xl dark:border-slate-700/50 dark:bg-slate-900/70">
                    <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-r from-indigo-500 to-blue-500 text-white shadow-lg">
                        <Users className="h-10 w-10" />
                    </div>
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-white">No Groups Found</h3>
                    <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                        Once you create mentee groups, their attendance summaries will appear here.
                    </p>
                </div>
            )
        }

        return (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {preparedGroups.map((group) => (
                    <div
                        key={group.id}
                        className="relative overflow-hidden rounded-3xl border border-white/20 bg-white/80 p-6 shadow-xl transition hover:-translate-y-1 hover:shadow-2xl dark:border-slate-700/50 dark:bg-slate-900/70"
                    >
                        <div
                            className="absolute inset-x-6 top-0 h-1 rounded-full"
                            style={{ background: group.color }}
                        />

                        <div className="mb-6 flex items-start justify-between">
                            <div>
                                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                                    {group.name}
                                </h3>
                                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                    {group.description || 'No description provided'}
                                </p>
                            </div>
                            <div className="rounded-2xl bg-white/70 p-3 shadow-sm dark:bg-slate-800/60">
                                <BarChart3 className="h-5 w-5 text-slate-500" />
                            </div>
                        </div>

                        <div className="mb-5 grid grid-cols-2 gap-3 text-sm">
                            <div className="rounded-2xl bg-slate-100/70 p-4 dark:bg-slate-800/70">
                                <p className="text-xs uppercase tracking-wide text-slate-500">Students</p>
                                <p className="mt-1 text-2xl font-semibold text-slate-900 dark:text-white">
                                    {group.stats.totalStudents}
                                </p>
                            </div>
                            <div className="rounded-2xl bg-slate-100/70 p-4 dark:bg-slate-800/70">
                                <p className="text-xs uppercase tracking-wide text-slate-500">Average Attendance</p>
                                <p className={`mt-1 text-2xl font-semibold ${group.stats.averagePercentage >= 90
                                    ? 'text-green-500'
                                    : group.stats.averagePercentage >= 75
                                        ? 'text-amber-500'
                                        : 'text-rose-500'
                                }`}>
                                    {group.stats.averagePercentage}%
                                </p>
                            </div>
                        </div>

                        <div className="space-y-2 rounded-2xl bg-gradient-to-br from-slate-100/70 via-white/70 to-white/50 p-4 shadow-inner dark:from-slate-800/50 dark:via-slate-900/40 dark:to-slate-900/20">
                            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                                <span className="inline-flex items-center gap-1 uppercase tracking-wide">
                                    <UserCheck className="h-3 w-3 text-green-500" /> Present Days
                                </span>
                                <span className="font-semibold text-slate-800 dark:text-slate-200">
                                    {group.stats.presentDays}
                                </span>
                            </div>
                            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                                <span className="inline-flex items-center gap-1 uppercase tracking-wide">
                                    <UserX className="h-3 w-3 text-rose-500" /> Absent Days
                                </span>
                                <span className="font-semibold text-slate-800 dark:text-slate-200">
                                    {group.stats.absentDays}
                                </span>
                            </div>
                        </div>

                        <button
                            onClick={() => handleDetailsOpen(group)}
                            className="mt-6 w-full rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-lg transition hover:scale-[1.02] hover:shadow-xl"
                        >
                            View Details
                        </button>
                    </div>
                ))}
            </div>
        )
    }

    return (
        <Layout>
            <div className="space-y-6">
                <header className="rounded-3xl border border-white/20 bg-white/80 p-8 shadow-xl dark:border-slate-700/50 dark:bg-slate-900/70">
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Attendance</h1>
                    <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                        Track group-wise attendance performance and review student level details.
                    </p>
                </header>

                {renderContent()}
            </div>

            <AttendanceDetailsModal
                isOpen={showDetails}
                onClose={() => setShowDetails(false)}
                group={selectedGroup}
            />
        </Layout>
    )
}

export default AttendancePage
