// src/routes/subscriptionRoutes.js
const express = require('express');
const router = express.Router();
const { addSubscription } = require('../controllers/subscriptionController'); // Define this controller

router.post('/subscribe', addSubscription);

module.exports = router;
