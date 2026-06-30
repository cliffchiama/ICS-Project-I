const express = require('express');
const router = express.Router();
const Property = require('../models/Property');
const auth = require('../middleware/auth');

// GET all approved properties (students see this)
router.get('/', async (req, res) => {
    try {
        const properties = await Property.find({ approval_status: 'approved' })
            .populate('landlord_id', 'name email phone_number')
            .sort({ createdAt: -1 });
        res.status(200).json(properties);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// GET properties for the logged-in landlord
router.get('/my-properties', auth, async (req, res) => {
    try {
        const properties = await Property.find({ landlord_id: req.user.id })
            .sort({ createdAt: -1 });
        res.status(200).json(properties);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// POST add a new property (landlord only)
router.post('/', auth, async (req, res) => {
    try {
        if (req.user.role !== 'landlord') {
            return res.status(403).json({ message: 'Only landlords can add properties' });
        }

        const {
            property_name, property_type, description,
            location, distance_from_campus,
            price, deposit, bills_included,
            availability_status, date_available,
            amenities
        } = req.body;

        const property = new Property({
            landlord_id: req.user.id,
            property_name,
            property_type,
            description,
            location,
            distance_from_campus,
            price,
            deposit,
            bills_included,
            availability_status: availability_status || 'available',
            date_available,
            amenities: amenities || {},
            approval_status: 'pending'
        });

        await property.save();

        res.status(201).json({
            message: 'Property submitted for approval',
            property
        });

    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// DELETE a property (landlord can only delete their own)
router.delete('/:id', auth, async (req, res) => {
    try {
        const property = await Property.findById(req.params.id);

        if (!property) {
            return res.status(404).json({ message: 'Property not found' });
        }

        // Make sure the landlord owns this property
        if (property.landlord_id.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorised to delete this property' });
        }

        await Property.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Property deleted successfully' });

    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// GET all pending properties (admin only)
router.get('/pending', auth, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied' });
        }
        const properties = await Property.find({ approval_status: 'pending' })
            .populate('landlord_id', 'name email');
        res.status(200).json(properties);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// PUT approve or reject a property (admin only)
router.put('/:id/approval', auth, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied' });
        }
        const { approval_status } = req.body; // 'approved' or 'rejected'
        const property = await Property.findByIdAndUpdate(
            req.params.id,
            { approval_status },
            { new: true }
        );
        if (!property) {
            return res.status(404).json({ message: 'Property not found' });
        }
        res.status(200).json({ message: `Property ${approval_status}`, property });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;