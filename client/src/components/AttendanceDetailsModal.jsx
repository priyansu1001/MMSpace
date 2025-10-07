import { X, UserCheck, UserX, Percent } from 'lucide-react'

const AttendanceDetailsModal = ({ isOpen, onClose, group }) => {
    if (!isOpen || !group) {
        return null
    }

    const students = group.mentees || []

    const getBadgeStyles = (percentage) => {
        if (percentage >= 90) {
            return {
                bar: 'bg-gradient-to-r from-green-500 to-emerald-500',
                badge: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
            }
        }
        if (percentage >= 75) {
            return {
                bar: 'bg-gradient-to-r from-yellow-500 to-amber-500',
                badge: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
            }
        }
        return {
            bar: 'bg-gradient-to-r from-red-500 to-rose-500',
            badge: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fadeIn">
            <div className="w-full max-w-5xl max-h-[90vh] overflow-hidden rounded-3xl border border-white/20 bg-white/90 dark:bg-slate-900/90 shadow-2xl backdrop-blur-xl">
                <div className="flex items-center justify-between border-b border-white/10 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 px-8 py-6">
                    <div>
                        <p className="text-sm uppercase tracking-wide text-blue-500 dark:text-blue-300">
                            {group.name}
                        </p>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                            Attendance Overview
                        </h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            Detailed attendance statistics for {students.length} students
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="rounded-full bg-white/60 p-3 text-slate-600 shadow-lg transition hover:bg-white/90 dark:bg-slate-800/60 dark:text-slate-200"
                        aria-label="Close attendance details"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="overflow-y-auto p-6 md:p-8 max-h-[calc(90vh-130px)]">
                    {students.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-slate-500 dark:text-slate-400">
                            <UserX className="mb-4 h-12 w-12" />
                            <p>No students found in this group.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="hidden rounded-2xl bg-white/60 px-6 py-3 text-xs font-semibold text-slate-500 shadow dark:bg-slate-800/60 md:grid md:grid-cols-12">
                                <span className="col-span-4">Student</span>
                                <span className="col-span-2 text-center">Present Days</span>
                                <span className="col-span-2 text-center">Absent Days</span>
                                <span className="col-span-2 text-center">Attendance %</span>
                                <span className="col-span-2 text-center">Leave Eligibility</span>
                            </div>

                            {students.map((student) => {
                                const presentDays = student.attendance?.presentDays ?? 0
                                const totalDays = student.attendance?.totalDays ?? 0
                                const percentage = student.attendance?.percentage ?? 0
                                const absentDays = Math.max(totalDays - presentDays, 0)
                                const { bar, badge } = getBadgeStyles(percentage)

                                return (
                                    <div
                                        key={student._id || student.studentId}
                                        className="group rounded-3xl border border-white/15 bg-white/80 px-4 py-5 shadow-md transition hover:-translate-y-1 hover:shadow-xl dark:bg-slate-900/70 md:px-6"
                                    >
                                        <div className="grid grid-cols-1 gap-4 md:grid-cols-12 md:items-center">
                                            <div className="md:col-span-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-lg font-semibold text-white shadow">
                                                        {(student.fullName ?? '?').charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-slate-900 dark:text-white">
                                                            {student.fullName || 'Unnamed Student'}
                                                        </p>
                                                        <p className="text-xs text-slate-500 dark:text-slate-400">
                                                            {student.studentId || 'ID unavailable'} • {student.class || '?'}-{student.section || '?'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between rounded-2xl bg-white/60 px-4 py-3 text-sm shadow-sm dark:bg-slate-800/60 md:col-span-2 md:flex md:justify-center">
                                                <UserCheck className="mr-2 h-4 w-4 text-green-500" />
                                                <span className="font-semibold text-slate-800 dark:text-slate-200">{presentDays}</span>
                                            </div>

                                            <div className="flex items-center justify-between rounded-2xl bg-white/60 px-4 py-3 text-sm shadow-sm dark:bg-slate-800/60 md:col-span-2 md:flex md:justify-center">
                                                <UserX className="mr-2 h-4 w-4 text-red-500" />
                                                <span className="font-semibold text-slate-800 dark:text-slate-200">{absentDays}</span>
                                            </div>

                                            <div className="md:col-span-2">
                                                <div className="flex flex-col items-center gap-2">
                                                    <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${badge}`}>
                                                        <Percent className="h-3 w-3" />
                                                        {percentage}%
                                                    </span>
                                                    <div className="h-2 w-full rounded-full bg-slate-200 dark:bg-slate-700">
                                                        <div
                                                            className={`h-full rounded-full transition-all duration-500 ${bar}`}
                                                            style={{ width: `${Math.min(Math.max(percentage, 0), 100)}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="text-center md:col-span-2">
                                                <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${percentage >= 75
                                                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300'
                                                    : 'bg-rose-100 text-rose-700 dark:bg-rose-900/20 dark:text-rose-300'
                                                }`}>
                                                    {percentage >= 75 ? 'Eligible' : 'Not Eligible'}
                                                </span>
                                                <p className="mt-1 text-[11px] uppercase tracking-wide text-slate-400">
                                                    75% threshold
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default AttendanceDetailsModal
