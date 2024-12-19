const nodemailer = require('nodemailer');
const config = require('../config/config');
const logger = require('../utils/logger');

const transporter = nodemailer.createTransport({
    host: config.emailService.host,
    port: config.emailService.port,
    auth: {
        user: config.emailService.user,
        pass: config.emailService.pass
    }
});

exports.sendReservationConfirmation = async (userEmail, reservation) => {
    try {
        const mailOptions = {
            from: config.emailService.user,
            to: userEmail,
            subject: 'Reservation Confirmation',
            html: `
                <h1>Reservation Confirmation</h1>
                <p>Your reservation has been confirmed.</p>
                <p>Pickup Time: ${reservation.pickupTime}</p>
                <p>Pickup Location: ${reservation.pickupLocation}</p>
                <p>Reservation ID: ${reservation._id}</p>
                <p>Please pick up your items before: ${reservation.expiryTime}</p>
            `
        };

        await transporter.sendMail(mailOptions);
    } catch (err) {
        logger.error('Email sending error:', err);
        throw new Error('Failed to send confirmation email');
    }
};