const User = require('../models/User');
const jwt = require('jsonwebtoken');
const config = require('../config/config');
const logger = require('../utils/logger');

exports.register = async (req, res) => {
    try {
        const { username, email, password, role, phone } = req.body;

        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: 'User already exists' });
        }

        user = new User({
            username,
            email,
            password,
            role,
            phone
        });

        await user.save();

        const token = jwt.sign({ userId: user._id }, config.jwtSecret, {
            expiresIn: config.jwtExpiration
        });

        res.status(201).json({ token });
    } catch (err) {
        logger.error('Registration error:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign({ userId: user._id }, config.jwtSecret, {
            expiresIn: config.jwtExpiration
        });

        res.json({ token });
    } catch (err) {
        logger.error('Login error:', err);
        res.status(500).json({ message: 'Server error' });
    }
};