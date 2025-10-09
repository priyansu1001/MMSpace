import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useEffect } from 'react'
import { AuthProvider } from './context/AuthContext'
import { SocketProvider } from './context/SocketContext'
import { ThemeProvider } from './context/ThemeContext'
import ProtectedRoute from './components/ProtectedRoute'
import LoginPage from './pages/LoginPage'
import AdminLoginPage from './pages/AdminLoginPage'
import AdminSignupPage from './pages/AdminSignupPage'
import AdminEditUser from './pages/AdminEditUser'
import SignupPage from './pages/SignupPage'
import DashboardPage from './pages/DashboardPage'
import GroupsPage from './pages/GroupsPage'
import ChatPage from './pages/ChatPage'
import LeavesPage from './pages/LeavesPage'
import GrievancePage from './pages/GrievancePage'
import AttendancePage from './pages/AttendancePage'
import ProfilePage from './pages/ProfilePage'
import initAutoHideScrollbars from './utils/autoHideScrollbar'

function App() {
    useEffect(() => {
        // Initialize auto-hide scrollbars
        initAutoHideScrollbars();
    }, []);

    return (
        <ThemeProvider>
            <AuthProvider>
                <SocketProvider>
                    <Router>
                        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
                            <Routes>
                                <Route path="/login" element={<LoginPage />} />
                                <Route path="/admin/login" element={<AdminLoginPage />} />
                                <Route path="/admin/signup" element={<AdminSignupPage />} />
                                <Route
                                    path="/admin/edit-user/:userId"
                                    element={
                                        <ProtectedRoute>
                                            <AdminEditUser />
                                        </ProtectedRoute>
                                    }
                                />
                                <Route path="/signup" element={<SignupPage />} />
                                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                                <Route
                                    path="/dashboard"
                                    element={
                                        <ProtectedRoute>
                                            <DashboardPage />
                                        </ProtectedRoute>
                                    }
                                />
                                <Route
                                    path="/groups"
                                    element={
                                        <ProtectedRoute>
                                            <GroupsPage />
                                        </ProtectedRoute>
                                    }
                                />
                                <Route
                                    path="/chat/:id?"
                                    element={
                                        <ProtectedRoute>
                                            <ChatPage />
                                        </ProtectedRoute>
                                    }
                                />
                                <Route
                                    path="/leaves"
                                    element={
                                        <ProtectedRoute>
                                            <LeavesPage />
                                        </ProtectedRoute>
                                    }
                                />
                                <Route
                                    path="/grievances"
                                    element={
                                        <ProtectedRoute>
                                            <GrievancePage />
                                        </ProtectedRoute>
                                    }
                                />
                                <Route
                                    path="/attendance"
                                    element={
                                        <ProtectedRoute>
                                            <AttendancePage />
                                        </ProtectedRoute>
                                    }
                                />
                                <Route
                                    path="/profile"
                                    element={
                                        <ProtectedRoute>
                                            <ProfilePage />
                                        </ProtectedRoute>
                                    }
                                />
                            </Routes>
                            <Toaster position="top-right" />
                        </div>
                    </Router>
                </SocketProvider>
            </AuthProvider>
        </ThemeProvider>
    )
}

export default App
