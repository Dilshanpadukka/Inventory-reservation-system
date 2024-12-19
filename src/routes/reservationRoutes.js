const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const reservationController = require('../controllers/reservationController');

router.post('/', auth, reservationController.createReservation);
router.get('/my-reservations', auth, reservationController.getUserReservations);
router.put('/:id/cancel', auth, reservationController.cancelReservation);

module.exports = router;