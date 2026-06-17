const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
    landlord_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    property_name: {
        type: String,
        required: true
    },
    property_type: {
        type: String,
        enum: ['Bedsitter', 'Single Room', '1 Bedroom', '2 Bedroom', '3 Bedroom', 'Shared Room'],
        required: true
    },
    description: {
        type: String,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    distance_from_campus: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    deposit: {
        type: Number,
        required: true
    },
    bills_included: {
        type: Boolean,
        default: false
    },
    availability_status: {
        type: String,
        enum: ['available', 'unavailable'],
        default: 'available'
    },
    date_available: {
        type: Date
    },
    amenities: {
        wifi: { type: Boolean, default: false },
        water: { type: Boolean, default: false },
        security: { type: Boolean, default: false },
        power_backup: { type: Boolean, default: false },
        furnished: { type: Boolean, default: false },
        parking: { type: Boolean, default: false },
        gym: { type: Boolean, default: false },
        kitchen: { type: Boolean, default: false }
    },
    photos: [String],
    approval_status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    }
}, { timestamps: true });

module.exports = mongoose.model('Property', propertySchema);