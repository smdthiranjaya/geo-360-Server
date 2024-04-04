const express = require('express');
const router = express.Router();
const { addSubscription } = require('../controllers/subscriptionController');

router.post('/subscribe', addSubscription);

module.exports = router;
