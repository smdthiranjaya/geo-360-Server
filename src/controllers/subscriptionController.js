// src/controllers/subscriptionController.js
const { pool } = require('../db');

async function addSubscription(req, res) {
    const { email, city } = req.body;
    try {
        const client = await pool.connect();
        const insertQuery = `
            INSERT INTO subscriptions (email, city)
            VALUES ($1, $2)
            RETURNING *;
        `;
        const result = await client.query(insertQuery, [email, city]);
        client.release();

        res.status(200).json({
            success: true,
            message: 'Subscription added successfully',
            subscription: result.rows[0]
        });
    } catch (error) {
        console.error('Error adding subscription:', error);
        res.status(500).json({
            success: false,
            message: 'Error adding subscription'
        });
    }
}

module.exports = { addSubscription };

