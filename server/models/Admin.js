const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    fullName: {
        type: String,
        required: true
    },
    employeeId: {
        type: String,
        required: true,
        unique: true
    },
    department: {
        type: String,
        default: 'Administration'
    },
    phone: {
        type: String,
        required: true
    },
    position: {
        type: String,
        default: 'System Administrator'
    },
    permissions: {
        manageUsers: { type: Boolean, default: true },
        manageMentors: { type: Boolean, default: true },
        manageMentees: { type: Boolean, default: true },
        manageGroups: { type: Boolean, default: true },
        viewReports: { type: Boolean, default: true },
        systemSettings: { type: Boolean, default: true }
    },
    profilePhoto: {
        type: String,
        default: ''
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Admin', adminSchema);