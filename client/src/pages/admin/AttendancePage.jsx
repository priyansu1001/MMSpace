import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import Layout from '../../components/Layout'
import AttendanceManagement from '../../components/admin/AttendanceManagement'
import { Shield } from 'lucide-react'
import { toast } from 'react-hot-toast'

const AttendancePage = () => {
    const { user, loading: authLoading } = useAuth()
    const navigate = useNavigate()

    useEffect(() => {
        if (user && user.role !== 'admin') {
            toast.error('Access denied. Admin privileges required.')
            navigate('/dashboard')
        }
    }, [user, navigate])

    if (authLoading) {
        return (
            <Layout>
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <span className="text-slate-600">Loading...</span>
                    </div>
                </div>
            </Layout>
        )
    }

    if (!user || user.role !== 'admin') {
        return (
            <Layout>
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <Shield className="h-16 w-16 text-red-500 mx-auto mb-4" />
                        <h2 className="text-xl font-bold text-gray-900 mb-2">Access Denied</h2>
                        <p className="text-gray-600">You need admin privileges to access this page.</p>
                    </div>
                </div>
            </Layout>
        )
    }

    return (
        <Layout>
            <AttendanceManagement />
        </Layout>
    )
}

export default AttendancePage