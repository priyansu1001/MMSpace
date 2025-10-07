const mongoose = require('mongoose');

const mentorSchema = new mongoose.Schema({
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
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    subjects: [{
        type: String
    }],
    qualifications: {
        type: String
    },
    citations: {
        type: String,
        default: ''
    },
    experience: {
        type: Number,
        default: 0
    },
    profilePhoto: {
        type: String,
        default: ''
    },
    officeHours: {
        type: String,
        default: '9:00 AM - 5:00 PM'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Mentor', mentorSchema);