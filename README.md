# MMSpace - Mentor-Mentee Management System

A comprehensive web application for managing mentor-mentee relationships in educational institutions. Built with React.js frontend and Node.js backend.

## 🚀 Features

### 👥 User Management
- **Multi-role Authentication**: Admin, Mentor, and Mentee roles
- **Profile Management**: Comprehensive user profiles with role-specific information
- **User Status Control**: Enable/disable user accounts

### 🎓 Mentorship System
- **Group Management**: Create and manage mentee groups
- **Individual Mentoring**: One-on-one mentor-mentee relationships
- **Progress Tracking**: Monitor mentee progress and attendance

### 💬 Communication
- **Real-time Chat**: Group and individual messaging
- **Notifications**: System-wide notification system
- **Announcements**: Broadcast important messages

### 📊 Dashboard & Analytics
- **Role-based Dashboards**: Customized views for each user type
- **Attendance Management**: Daily attendance tracking with visual analytics
- **Progress Reports**: Comprehensive reporting system

### 📝 Leave Management
- **Leave Requests**: Submit and manage leave applications
- **Approval Workflow**: Mentor approval system
- **Leave History**: Track all leave requests and statuses

### 🎨 Modern UI/UX
- **Glassmorphism Design**: Modern, translucent interface
- **Dark Mode Support**: Toggle between light and dark themes
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Smooth Animations**: Enhanced user experience with transitions

## 🛠️ Tech Stack

### Frontend
- **React.js** - UI library
- **React Router** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Icon library
- **Axios** - HTTP client
- **React Hook Form** - Form handling
- **React Hot Toast** - Notifications
- **Socket.io Client** - Real-time communication

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **Socket.io** - Real-time communication
- **Bcrypt** - Password hashing
- **Multer** - File upload handling

## 📦 Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- npm or yarn

### Clone the Repository
```bash
git clone https://github.com/yourusername/mmspace.git
cd mmspace
```

### Backend Setup
```bash
cd server
npm install
```

Create a `.env` file in the server directory:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/mmspace
JWT_SECRET=your_jwt_secret_key
NODE_ENV=development
```

Start the backend server:
```bash
npm run dev
```

### Frontend Setup
```bash
cd client
npm install
```

Create a `.env` file in the client directory:
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000
```

Start the frontend development server:
```bash
npm start
```

## 🚀 Deployment

### Backend Deployment
1. Set environment variables for production
2. Build the application: `npm run build`
3. Start the production server: `npm start`

### Frontend Deployment
1. Build the application: `npm run build`
2. Deploy the `build` folder to your hosting service

## 📱 Usage

### Admin Features
- **User Management**: Create, edit, and manage all users
- **System Overview**: Monitor system-wide statistics
- **Attendance Management**: Bulk attendance marking and reporting
- **Role Assignment**: Assign mentors to mentees

### Mentor Features
- **Group Management**: Create and manage mentee groups
- **Attendance Tracking**: Mark and monitor mentee attendance
- **Leave Approval**: Review and approve leave requests
- **Progress Monitoring**: Track individual mentee progress
- **Communication**: Chat with mentees individually or in groups

### Mentee Features
- **Profile Management**: Update personal information
- **Attendance View**: Check attendance records and statistics
- **Leave Requests**: Submit leave applications
- **Communication**: Chat with mentors and group members
- **Progress Tracking**: View personal academic progress

## 🎨 Design Features

### Modern Interface
- **Glassmorphism Effects**: Translucent cards with backdrop blur
- **Gradient Backgrounds**: Beautiful color gradients throughout
- **Smooth Animations**: Hover effects and transitions
- **Responsive Grid**: Adaptive layouts for all screen sizes

### User Experience
- **Intuitive Navigation**: Easy-to-use interface
- **Visual Feedback**: Loading states and success messages
- **Accessibility**: Screen reader friendly and keyboard navigable
- **Performance**: Optimized for fast loading and smooth interactions

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Users
- `GET /api/admin/users` - Get all users (Admin only)
- `PUT /api/admin/users/:id/details` - Update user details
- `DELETE /api/admin/users/:id` - Delete user

### Groups
- `GET /api/groups` - Get user's groups
- `POST /api/groups` - Create new group
- `PUT /api/groups/:id` - Update group
- `DELETE /api/groups/:id` - Archive group

### Attendance
- `GET /api/admin/attendance` - Get attendance data
- `POST /api/admin/attendance` - Save attendance records

### Leaves
- `GET /api/leaves` - Get leave requests
- `POST /api/leaves` - Create leave request
- `PUT /api/leaves/:id` - Update leave status