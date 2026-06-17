const mongoose = require('mongoose');

const viewingRequestSchema = new mongoose.Schema({
    student_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    property_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Property',
        required: true
    },
    request_date: {
        type: Date,
        default: Date.now
    },
    viewing_date: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'declined', 'cancelled'],
        default: 'pending'
    },
    message: {
        type: String
    }
}, { timestamps: true });

module.exports = mongoose.model('ViewingRequest', viewingRequestSchema);