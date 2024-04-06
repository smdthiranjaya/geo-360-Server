const express = require('express');
const router = express.Router();
// Import the addSubscription function from the subscription controller
const { addSubscription } = require('../controllers/subscriptionController');

// Define a POST route for subscriptions
router.post('/subscribe', addSubscription);

// Export the router for use in other parts of the application
module.exports = router;
