import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { toast } from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import Layout from '../components/Layout'
import LoadingSpinner from '../components/LoadingSpinner'
import api from '../services/api'
import { ArrowLeft, Save, User, GraduationCap, Shield } from 'lucide-react'

const AdminEditUser = () => {
    const { userId } = useParams()
    const navigate = useNavigate()
    const { user } = useAuth()
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [userData, setUserData] = useState(null)
    const [mentors, setMentors] = useState([])

    const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm()

    // Only allow access to admins
    if (!user || user.role !== 'admin') {
        return <Navigate to="/admin/login" replace />
    }

    useEffect(() => {
        fetchUserData()
        fetchMentors()
    }, [userId])

    const fetchUserData = async () => {
        try {
            const response = await api.get(`/admin/users`)
            const foundUser = response.data.users.find(u => u._id === userId)
            if (foundUser) {
                setUserData(foundUser)
                // Populate form with existing data
                reset({
                    email: foundUser.email,
                    fullName: foundUser.profile?.fullName || '',
                    phone: foundUser.profile?.phone || '',
                    // Role-specific fields
                    ...(foundUser.role === 'mentor' && {
                        department: foundUser.profile?.department || '',
                        employeeId: foundUser.profile?.employeeId || '',
                        subjects: foundUser.profile?.subjects?.join(', ') || '',
                        qualifications: foundUser.profile?.qualifications || '',
                        citations: foundUser.profile?.citations || '',
                        experience: foundUser.profile?.experience || 0,
                        officeHours: foundUser.profile?.officeHours || ''
                    }),
                    ...(foundUser.role === 'mentee' && {
                        studentId: foundUser.profile?.studentId || '',
                        class: foundUser.profile?.class || '',
                        section: foundUser.profile?.section || '',
                        academicYear: foundUser.profile?.academicYear || '',
                        dateOfBirth: foundUser.profile?.dateOfBirth ?
                            new Date(foundUser.profile.dateOfBirth).toISOString().split('T')[0] : '',
                        address: foundUser.profile?.address || '',
                        bloodGroup: foundUser.profile?.bloodGroup || '',
                        medicalConditions: foundUser.profile?.medicalConditions || '',
                        hobbies: foundUser.profile?.hobbies?.join(', ') || '',
                        mentorId: foundUser.profile?.mentorId?._id || '',
                        // Parent info
                        fatherName: foundUser.profile?.parentInfo?.fatherName || '',
                        motherName: foundUser.profile?.parentInfo?.motherName || '',
                        primaryContact: foundUser.profile?.parentInfo?.primaryContact || '',
                        secondaryContact: foundUser.profile?.parentInfo?.secondaryContact || '',
                        parentEmail: foundUser.profile?.parentInfo?.email || '',
                        emergencyContact: foundUser.profile?.parentInfo?.emergencyContact || '',
                        // Attendance
                        totalDays: foundUser.profile?.attendance?.totalDays || 0,
                        presentDays: foundUser.profile?.attendance?.presentDays || 0
                    }),
                    ...(foundUser.role === 'admin' && {
                        department: foundUser.profile?.department || '',
                        employeeId: foundUser.profile?.employeeId || '',
                        position: foundUser.profile?.position || ''
                    })
                })
            }
        } catch (error) {
            toast.error('Failed to fetch user data')
            navigate('/dashboard')
        } finally {
            setLoading(false)
        }
    }

    const fetchMentors = async () => {
        try {
            const response = await api.get('/admin/mentors')
            setMentors(response.data)
        } catch (error) {
            console.error('Error fetching mentors:', error)
        }
    }

    const onSubmit = async (data) => {
        setSaving(true)
        try {
            // Update user email
            await api.put(`/admin/users/${userId}`, {
                email: data.email
            })

            // Update profile based on role
            let profileData = {
                fullName: data.fullName,
                phone: data.phone
            }

            if (userData.role === 'mentor') {
                profileData = {
                    ...profileData,
                    department: data.department,
                    employeeId: data.employeeId,
                    subjects: data.subjects ? data.subjects.split(',').map(s => s.trim()) : [],
                    qualifications: data.qualifications,
                    citations: data.citations,
                    experience: parseInt(data.experience) || 0,
                    officeHours: data.officeHours
                }
            } else if (userData.role === 'mentee') {
                profileData = {
                    ...profileData,
                    studentId: data.studentId,
                    class: data.class,
                    section: data.section,
                    academicYear: data.academicYear,
                    dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
                    address: data.address,
                    bloodGroup: data.bloodGroup,
                    medicalConditions: data.medicalConditions,
                    hobbies: data.hobbies ? data.hobbies.split(',').map(h => h.trim()) : [],
                    mentorId: data.mentorId || null,
                    parentInfo: {
                        fatherName: data.fatherName,
                        motherName: data.motherName,
                        primaryContact: data.primaryContact,
                        secondaryContact: data.secondaryContact,
                        email: data.parentEmail,
                        emergencyContact: data.emergencyContact
                    },
                    attendance: {
                        totalDays: parseInt(data.totalDays) || 0,
                        presentDays: parseInt(data.presentDays) || 0,
                        percentage: data.totalDays > 0 ?
                            Math.round((parseInt(data.presentDays) / parseInt(data.totalDays)) * 100) : 0
                    }
                }
            } else if (userData.role === 'admin') {
                profileData = {
                    ...profileData,
                    department: data.department,
                    employeeId: data.employeeId,
                    position: data.position
                }
            }

            await api.put(`/admin/users/${userId}/profile`, profileData)

            toast.success('User updated successfully!')
            navigate('/dashboard')
        } catch (error) {
            toast.error('Failed to update user')
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <Layout>
                <div className="flex items-center justify-center h-64">
                    <LoadingSpinner />
                </div>
            </Layout>
        )
    }

    if (!userData) {
        return (
            <Layout>
                <div className="text-center py-12">
                    <h2 className="text-2xl font-bold text-gray-900">User Not Found</h2>
                    <Link to="/dashboard" className="text-primary-600 hover:text-primary-500">
                        ← Back to Dashboard
                    </Link>
                </div>
            </Layout>
        )
    }

    const getRoleIcon = (role) => {
        switch (role) {
            case 'admin': return <Shield className="h-5 w-5 text-red-600" />
            case 'mentor': return <User className="h-5 w-5 text-blue-600" />
            case 'mentee': return <GraduationCap className="h-5 w-5 text-green-600" />
            default: return <User className="h-5 w-5 text-gray-600" />
        }
    }

    return (
        <Layout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center space-x-4">
                    <Link
                        to="/dashboard"
                        className="flex items-center text-gray-600 hover:text-gray-900"
                    >
                        <ArrowLeft className="h-5 w-5 mr-1" />
                        Back
                    </Link>
                    <div className="flex items-center space-x-3">
                        {getRoleIcon(userData.role)}
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                Edit {userData.role.charAt(0).toUpperCase() + userData.role.slice(1)}
                            </h1>
                            <p className="text-sm text-gray-600">{userData.email}</p>
                        </div>
                    </div>
                </div>

                {/* Form */}
                <div className="bg-white shadow rounded-lg">
                    <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
                        {/* Basic Information */}
                        <div>
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Full Name
                                    </label>
                                    <input
                                        {...register('fullName', { required: 'Full name is required' })}
                                        type="text"
                                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                                    />
                                    {errors.fullName && (
                                        <p className="mt-1 text-sm text-red-600">{errors.fullName.message}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Email Address
                                    </label>
                                    <input
                                        {...register('email', {
                                            required: 'Email is required',
                                            pattern: {
                                                value: /^\S+@\S+$/i,
                                                message: 'Invalid email address'
                                            }
                                        })}
                                        type="email"
                                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                                    />
                                    {errors.email && (
                                        <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Phone Number
                                    </label>
                                    <input
                                        {...register('phone')}
                                        type="tel"
                                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Role-specific fields */}
                        {userData.role === 'mentor' && (
                            <div>
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Professional Information</h3>
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Department</label>
                                        <input
                                            {...register('department')}
                                            type="text"
                                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Employee ID</label>
                                        <input
                                            {...register('employeeId')}
                                            type="text"
                                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Subjects (comma-separated)</label>
                                        <input
                                            {...register('subjects')}
                                            type="text"
                                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                                            placeholder="Math, Science, English"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Experience (years)</label>
                                        <input
                                            {...register('experience')}
                                            type="number"
                                            min="0"
                                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                                        />
                                    </div>
                                    <div className="sm:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700">Qualifications</label>
                                        <textarea
                                            {...register('qualifications')}
                                            rows="3"
                                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                                            placeholder="PhD, M.Sc, certifications..."
                                        />
                                    </div>
                                    <div className="sm:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700">Citations & Publications</label>
                                        <textarea
                                            {...register('citations')}
                                            rows="4"
                                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                                            placeholder="Research papers, publications, citations..."
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Office Hours</label>
                                        <input
                                            {...register('officeHours')}
                                            type="text"
                                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                                            placeholder="9:00 AM - 5:00 PM"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {userData.role === 'mentee' && (
                            <>
                                {/* Academic Information */}
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900 mb-4">Academic Information</h3>
                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Student ID</label>
                                            <input
                                                {...register('studentId')}
                                                type="text"
                                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Assigned Mentor</label>
                                            <select
                                                {...register('mentorId')}
                                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                                            >
                                                <option value="">Select Mentor</option>
                                                {mentors.map((mentor) => (
                                                    <option key={mentor._id} value={mentor._id}>
                                                        {mentor.fullName} - {mentor.department}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Class</label>
                                            <input
                                                {...register('class')}
                                                type="text"
                                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Section</label>
                                            <input
                                                {...register('section')}
                                                type="text"
                                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Academic Year</label>
                                            <input
                                                {...register('academicYear')}
                                                type="text"
                                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
                                            <input
                                                {...register('dateOfBirth')}
                                                type="date"
                                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Personal Information */}
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h3>
                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                        <div className="sm:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700">Address</label>
                                            <textarea
                                                {...register('address')}
                                                rows="2"
                                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Blood Group</label>
                                            <input
                                                {...register('bloodGroup')}
                                                type="text"
                                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Hobbies (comma-separated)</label>
                                            <input
                                                {...register('hobbies')}
                                                type="text"
                                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                                                placeholder="Reading, Sports, Music"
                                            />
                                        </div>
                                        <div className="sm:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700">Medical Conditions</label>
                                            <textarea
                                                {...register('medicalConditions')}
                                                rows="2"
                                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Parent Information */}
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900 mb-4">Parent Information</h3>
                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Father's Name</label>
                                            <input
                                                {...register('fatherName')}
                                                type="text"
                                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Mother's Name</label>
                                            <input
                                                {...register('motherName')}
                                                type="text"
                                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Primary Contact</label>
                                            <input
                                                {...register('primaryContact')}
                                                type="tel"
                                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Secondary Contact</label>
                                            <input
                                                {...register('secondaryContact')}
                                                type="tel"
                                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Parent Email</label>
                                            <input
                                                {...register('parentEmail')}
                                                type="email"
                                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Emergency Contact</label>
                                            <input
                                                {...register('emergencyContact')}
                                                type="tel"
                                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Attendance */}
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900 mb-4">Attendance</h3>
                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Total Days</label>
                                            <input
                                                {...register('totalDays')}
                                                type="number"
                                                min="0"
                                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Present Days</label>
                                            <input
                                                {...register('presentDays')}
                                                type="number"
                                                min="0"
                                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}

                        {userData.role === 'admin' && (
                            <div>
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Administrative Information</h3>
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Department</label>
                                        <input
                                            {...register('department')}
                                            type="text"
                                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Employee ID</label>
                                        <input
                                            {...register('employeeId')}
                                            type="text"
                                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Position</label>
                                        <input
                                            {...register('position')}
                                            type="text"
                                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Submit Button */}
                        <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                            <Link
                                to="/dashboard"
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                            >
                                Cancel
                            </Link>
                            <button
                                type="submit"
                                disabled={saving}
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50"
                            >
                                <Save className="h-4 w-4 mr-2" />
                                {saving ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </Layout>
    )
}

export default AdminEditUser