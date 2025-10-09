import { useState, useEffect } from 'react'
import {
    BarChart3,
    TrendingUp,
    Users,
    Calendar,
    Activity,
    PieChart,
    Target,
    Award,
    Clock,
    MessageSquare,
    BookOpen,
    UserCheck
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import api from '../../services/api'
import LoadingSpinner from '../LoadingSpinner'

const AnalyticsDashboard = () => {
    const [analytics, setAnalytics] = useState(null)
    const [reports, setReports] = useState(null)
    const [loading, setLoading] = useState(true)
    const [timeRange, setTimeRange] = useState('30d')

    useEffect(() => {
        fetchAnalytics()
        fetchReports()
    }, [timeRange])

    const fetchAnalytics = async () => {
        try {
            const response = await api.get('/admin/dashboard')
            setAnalytics(response.data)
        } catch (error) {
            console.error('Error fetching analytics:', error)
            toast.error('Failed to fetch analytics')
        }
    }

    const fetchReports = async () => {
        try {
            const response = await api.get('/admin/reports/overview')
            setReports(response.data)
        } catch (error) {
            console.error('Error fetching reports:', error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <LoadingSpinner />
            </div>
        )
    }

    const StatCard = ({ title, value, change, icon: Icon, color, trend }) => (
        <div className={`bg-gradient-to-br ${color} rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]`}>
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-white/80 text-sm font-medium">{title}</p>
                    <p className="text-3xl font-bold mt-1">{value}</p>
                    {change && (
                        <div className="flex items-center mt-2">
                            <TrendingUp className={`h-4 w-4 mr-1 ${trend === 'up' ? 'text-green-200' : 'text-red-200'}`} />
                            <span className="text-white/90 text-sm">{change}</span>
                        </div>
                    )}
                </div>
                <div className="bg-white/20 p-3 rounded-xl">
                    <Icon className="h-8 w-8" />
                </div>
            </div>
        </div>
    )

    const ChartCard = ({ title, children, className = "" }) => (
        <div className={`bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl shadow-lg rounded-2xl border border-white/20 dark:border-slate-700/50 p-6 ${className}`}>
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">{title}</h3>
            {children}
        </div>
    )

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl shadow-2xl rounded-3xl border border-white/20 dark:border-slate-700/50 p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center">
                            <BarChart3 className="h-6 w-6 mr-3 text-purple-600 dark:text-purple-400" />
                            Analytics & Insights
                        </h2>
                        <p className="text-slate-600 dark:text-slate-400 mt-1">
                            Monitor system performance and user engagement
                        </p>
                    </div>

                    <select
                        value={timeRange}
                        onChange={(e) => setTimeRange(e.target.value)}
                        className="px-4 py-2 bg-white/50 dark:bg-slate-700/50 border border-slate-200/50 dark:border-slate-600/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-slate-800 dark:text-white"
                    >
                        <option value="7d">Last 7 days</option>
                        <option value="30d">Last 30 days</option>
                        <option value="90d">Last 90 days</option>
                        <option value="1y">Last year</option>
                    </select>
                </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Users"
                    value={analytics?.stats?.totalUsers || 0}
                    change="+12% from last month"
                    icon={Users}
                    color="from-blue-500 to-blue-600"
                    trend="up"
                />
                <StatCard
                    title="Active Users"
                    value={analytics?.stats?.activeUsers || 0}
                    change="+8% from last month"
                    icon={UserCheck}
                    color="from-green-500 to-emerald-600"
                    trend="up"
                />
                <StatCard
                    title="Mentor-Mentee Pairs"
                    value={analytics?.stats?.totalMentees || 0}
                    change="+15% from last month"
                    icon={Target}
                    color="from-purple-500 to-purple-600"
                    trend="up"
                />
                <StatCard
                    title="Avg. Attendance"
                    value={`${reports?.attendanceStats?.avgAttendance?.toFixed(1) || 0}%`}
                    change="+2.3% from last month"
                    icon={Calendar}
                    color="from-orange-500 to-red-500"
                    trend="up"
                />
            </div>

            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* User Registration Trends */}
                <ChartCard title="User Registration Trends">
                    <div className="space-y-4">
                        {reports?.userTrends?.length > 0 ? (
                            <div className="space-y-3">
                                {reports.userTrends.slice(-7).map((trend, index) => (
                                    <div key={trend._id} className="flex items-center justify-between">
                                        <span className="text-sm text-slate-600 dark:text-slate-400">
                                            {new Date(trend._id).toLocaleDateString()}
                                        </span>
                                        <div className="flex items-center space-x-2">
                                            <div className="w-32 bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                                                <div
                                                    className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-500"
                                                    style={{ width: `${Math.min((trend.count / 10) * 100, 100)}%` }}
                                                ></div>
                                            </div>
                                            <span className="text-sm font-medium text-slate-800 dark:text-white w-8">
                                                {trend.count}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <Activity className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                                <p className="text-slate-500 dark:text-slate-400">No registration data available</p>
                            </div>
                        )}
                    </div>
                </ChartCard>

                {/* Leave Request Statistics */}
                <ChartCard title="Leave Request Statistics">
                    <div className="space-y-4">
                        {reports?.leaveStats?.length > 0 ? (
                            <div className="space-y-4">
                                {reports.leaveStats.map((stat, index) => {
                                    const colors = {
                                        pending: 'from-yellow-500 to-orange-500',
                                        approved: 'from-green-500 to-emerald-500',
                                        rejected: 'from-red-500 to-red-600'
                                    }
                                    const total = reports.leaveStats.reduce((sum, s) => sum + s.count, 0)
                                    const percentage = ((stat.count / total) * 100).toFixed(1)

                                    return (
                                        <div key={stat._id} className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-medium text-slate-800 dark:text-white capitalize">
                                                    {stat._id}
                                                </span>
                                                <span className="text-sm text-slate-600 dark:text-slate-400">
                                                    {stat.count} ({percentage}%)
                                                </span>
                                            </div>
                                            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                                                <div
                                                    className={`bg-gradient-to-r ${colors[stat._id] || 'from-slate-500 to-slate-600'} h-2 rounded-full transition-all duration-500`}
                                                    style={{ width: `${percentage}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <Calendar className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                                <p className="text-slate-500 dark:text-slate-400">No leave data available</p>
                            </div>
                        )}
                    </div>
                </ChartCard>
            </div>

            {/* Performance Metrics */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* System Health */}
                <ChartCard title="System Health">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-xl">
                            <div className="flex items-center space-x-3">
                                <div className="h-3 w-3 bg-green-500 rounded-full animate-pulse"></div>
                                <span className="text-sm font-medium text-green-800 dark:text-green-300">Server Status</span>
                            </div>
                            <span className="text-sm text-green-600 dark:text-green-400">Online</span>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                            <div className="flex items-center space-x-3">
                                <div className="h-3 w-3 bg-blue-500 rounded-full animate-pulse"></div>
                                <span className="text-sm font-medium text-blue-800 dark:text-blue-300">Database</span>
                            </div>
                            <span className="text-sm text-blue-600 dark:text-blue-400">Connected</span>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                            <div className="flex items-center space-x-3">
                                <div className="h-3 w-3 bg-purple-500 rounded-full animate-pulse"></div>
                                <span className="text-sm font-medium text-purple-800 dark:text-purple-300">Real-time Chat</span>
                            </div>
                            <span className="text-sm text-purple-600 dark:text-purple-400">Active</span>
                        </div>
                    </div>
                </ChartCard>

                {/* Recent Activity */}
                <ChartCard title="Recent Activity">
                    <div className="space-y-3">
                        {analytics?.recentUsers?.slice(0, 5).map((user, index) => (
                            <div key={user._id} className="flex items-center space-x-3 p-2 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-lg transition-colors">
                                <div className={`h-8 w-8 rounded-full flex items-center justify-center ${user.role === 'admin' ? 'bg-red-100 dark:bg-red-900/30' :
                                        user.role === 'mentor' ? 'bg-blue-100 dark:bg-blue-900/30' :
                                            'bg-green-100 dark:bg-green-900/30'
                                    }`}>
                                    {user.role === 'admin' ? '👑' : user.role === 'mentor' ? '👨‍🏫' : '👨‍🎓'}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-slate-800 dark:text-white truncate">
                                        {user.email}
                                    </p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                        Joined {new Date(user.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </ChartCard>

                {/* Quick Stats */}
                <ChartCard title="Quick Stats">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <MessageSquare className="h-4 w-4 text-blue-500" />
                                <span className="text-sm text-slate-600 dark:text-slate-400">Total Groups</span>
                            </div>
                            <span className="text-lg font-bold text-slate-800 dark:text-white">
                                {analytics?.stats?.totalGroups || 0}
                            </span>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <Calendar className="h-4 w-4 text-orange-500" />
                                <span className="text-sm text-slate-600 dark:text-slate-400">Pending Leaves</span>
                            </div>
                            <span className="text-lg font-bold text-slate-800 dark:text-white">
                                {analytics?.stats?.pendingLeaves || 0}
                            </span>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <BookOpen className="h-4 w-4 text-green-500" />
                                <span className="text-sm text-slate-600 dark:text-slate-400">Total Students</span>
                            </div>
                            <span className="text-lg font-bold text-slate-800 dark:text-white">
                                {reports?.attendanceStats?.totalStudents || 0}
                            </span>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <Award className="h-4 w-4 text-purple-500" />
                                <span className="text-sm text-slate-600 dark:text-slate-400">Avg Performance</span>
                            </div>
                            <span className="text-lg font-bold text-slate-800 dark:text-white">
                                {reports?.attendanceStats?.avgAttendance?.toFixed(0) || 0}%
                            </span>
                        </div>
                    </div>
                </ChartCard>
            </div>

            {/* Engagement Metrics */}
            <ChartCard title="User Engagement Overview" className="col-span-full">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl">
                        <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                            {((analytics?.stats?.activeUsers / analytics?.stats?.totalUsers) * 100).toFixed(1) || 0}%
                        </div>
                        <div className="text-sm text-blue-600/70 dark:text-blue-400/70">User Activity Rate</div>
                    </div>

                    <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl">
                        <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
                            {analytics?.stats?.totalMentors || 0}
                        </div>
                        <div className="text-sm text-green-600/70 dark:text-green-400/70">Active Mentors</div>
                    </div>

                    <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl">
                        <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">
                            {analytics?.stats?.totalMentees || 0}
                        </div>
                        <div className="text-sm text-purple-600/70 dark:text-purple-400/70">Active Mentees</div>
                    </div>

                    <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-xl">
                        <div className="text-3xl font-bold text-orange-600 dark:text-orange-400 mb-2">
                            {reports?.attendanceStats?.avgAttendance?.toFixed(1) || 0}%
                        </div>
                        <div className="text-sm text-orange-600/70 dark:text-orange-400/70">Avg Attendance</div>
                    </div>
                </div>
            </ChartCard>
        </div>
    )
}

export default AnalyticsDashboard