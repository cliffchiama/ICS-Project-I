const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const auth = require('../middleware/auth');

// GET all notifications for the logged-in user
router.get('/', auth, async (req, res) => {
    try {
        const notifications = await Notification.find({ user_id: req.user.id })
            .populate('property_id', 'property_name')
            .sort({ createdAt: -1 });
        res.status(200).json(notifications);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// PUT mark a single notification as read
router.put('/:id/read', auth, async (req, res) => {
    try {
        const notification = await Notification.findById(req.params.id);
        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }
        if (notification.user_id.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorised' });
        }
        notification.read = true;
        await notification.save();
        res.status(200).json({ message: 'Marked as read', notification });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// PUT mark all notifications as read for the logged-in user
router.put('/read-all', auth, async (req, res) => {
    try {
        await Notification.updateMany(
            { user_id: req.user.id, read: false },
            { read: true }
        );
        res.status(200).json({ message: 'All notifications marked as read' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;