const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');

// GET all users (admin only)
router.get('/', auth, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied' });
        }
        const users = await User.find().select('-password');
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// PUT suspend or activate a user (admin only)
router.put('/:id/status', auth, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied' });
        }
        const { status } = req.body; // 'active' or 'suspended'
        const user = await User.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        ).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json({ message: `User ${status}`, user });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// GET own profile
router.get('/me', auth, async (req, res) => {
    try {
        const userDoc = await User.findById(req.user.id).select('-password');
        if (!userDoc) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json(userDoc);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// PUT update own profile
router.put('/me', auth, async (req, res) => {
    try {
        const { name, phone_number } = req.body;
        const userDoc = await User.findByIdAndUpdate(
            req.user.id,
            { name, phone_number },
            { new: true }
        ).select('-password');
        res.status(200).json({ message: 'Profile updated', user: userDoc });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;