const Reservation = require('../models/Reservation');
const Product = require('../models/Product');
const { sendReservationConfirmation } = require('../services/emailService');
const logger = require('../utils/logger');

exports.createReservation = async (req, res) => {
    try {
        const { items, pickupTime, pickupLocation } = req.body;
        
        // Calculate expiry time (24 hours from now)
        const expiryTime = new Date(Date.now() + 24 * 60 * 60 * 1000);

        // Check product availability and update quantities
        for (const item of items) {
            const product = await Product.findById(item.product);
            if (!product || product.availableQuantity < item.quantity) {
                return res.status(400).json({ 
                    message: `Product ${product.name} is not available in requested quantity` 
                });
            }
            
            product.availableQuantity -= item.quantity;
            await product.save();
        }

        const reservation = new Reservation({
            user: req.user.id,
            items,
            pickupTime,
            pickupLocation,
            expiryTime
        });

        await reservation.save();

        // Send confirmation email
        await sendReservationConfirmation(req.user.email, reservation);

        res.status(201).json(reservation);
    } catch (err) {
        logger.error('Reservation creation error:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getUserReservations = async (req, res) => {
    try {
        const reservations = await Reservation.find({ user: req.user.id })
            .populate('items.product')
            .sort('-createdAt');
        res.json(reservations);
    } catch (err) {
        logger.error('Get reservations error:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.cancelReservation = async (req, res) => {
    try {
        const reservation = await Reservation.findById(req.params.id);

        if (!reservation) {
            return res.status(404).json({ message: 'Reservation not found' });
        }

        if (reservation.user.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        // Return items to available inventory
        for (const item of reservation.items) {
            const product = await Product.findById(item.product);
            product.availableQuantity += item.quantity;
            await product.save();
        }

        reservation.status = 'cancelled';
        await reservation.save();

        res.json({ message: 'Reservation cancelled successfully' });
    } catch (err) {
        logger.error('Cancel reservation error:', err);
        res.status(500).json({ message: 'Server error' });
    }
};