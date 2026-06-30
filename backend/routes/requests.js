const express = require('express');
const router = express.Router();
const ViewingRequest = require('../models/ViewingRequest');
const Property = require('../models/Property');
const auth = require('../middleware/auth');

// POST create a new viewing request (student only)
router.post('/', auth, async (req, res) => {
    try {
        if (req.user.role !== 'student') {
            return res.status(403).json({ message: 'Only students can request viewings' });
        }

        const { property_id, viewing_date, message } = req.body;

        if (!property_id || !viewing_date) {
            return res.status(400).json({ message: 'property_id and viewing_date are required' });
        }

        const property = await Property.findById(property_id);
        if (!property) {
            return res.status(404).json({ message: 'Property not found' });
        }

        const request = new ViewingRequest({
            student_id: req.user.id,
            property_id,
            viewing_date,
            message,
            status: 'pending'
        });

        await request.save();
        await request.populate('property_id', 'property_name location price');

        res.status(201).json({ message: 'Viewing request submitted', request });

    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// GET all requests for the logged-in student
router.get('/my-requests', auth, async (req, res) => {
    try {
        const requests = await ViewingRequest.find({ student_id: req.user.id })
            .populate('property_id', 'property_name location price')
            .sort({ createdAt: -1 });
        res.status(200).json(requests);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// GET all requests for properties owned by the logged-in landlord
router.get('/landlord-requests', auth, async (req, res) => {
    try {
        if (req.user.role !== 'landlord') {
            return res.status(403).json({ message: 'Access denied' });
        }
        const myProperties = await Property.find({ landlord_id: req.user.id }).select('_id');
        const propertyIds = myProperties.map(p => p._id);

        const requests = await ViewingRequest.find({ property_id: { $in: propertyIds } })
            .populate('property_id', 'property_name location price')
            .populate('student_id', 'name email phone_number')
            .sort({ createdAt: -1 });

        res.status(200).json(requests);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// PUT cancel a request (student can only cancel their own, and only if not already cancelled)
router.put('/:id/cancel', auth, async (req, res) => {
    try {
        const request = await ViewingRequest.findById(req.params.id);

        if (!request) {
            return res.status(404).json({ message: 'Request not found' });
        }

        if (request.student_id.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorised to cancel this request' });
        }

        if (request.status === 'cancelled') {
            return res.status(400).json({ message: 'Request is already cancelled' });
        }

        request.status = 'cancelled';
        await request.save();

        res.status(200).json({ message: 'Request cancelled', request });

    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// PUT approve or reject a request (landlord only, must own the property)
router.put('/:id/status', auth, async (req, res) => {
    try {
        if (req.user.role !== 'landlord') {
            return res.status(403).json({ message: 'Access denied' });
        }

        const { status } = req.body; // 'approved' or 'declined'
        if (!['approved', 'declined'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const request = await ViewingRequest.findById(req.params.id).populate('property_id');
        if (!request) {
            return res.status(404).json({ message: 'Request not found' });
        }

        if (request.property_id.landlord_id.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorised to update this request' });
        }

        request.status = status;
        await request.save();

        res.status(200).json({ message: `Request ${status}`, request });

    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;