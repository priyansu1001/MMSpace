const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    mentorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Mentor',
        required: true
    },
    menteeIds: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Mentee'
    }],
    description: {
        type: String,
        default: ''
    },
    color: {
        type: String,
        default: '#3B82F6'
    },
    isArchived: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Group', groupSchema);