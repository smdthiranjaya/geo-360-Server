const pool = require('../db'); 

// Define an asynchronous function to add a subscription
async function addSubscription(req, res) {
    const { email, city } = req.body;
    try {
        // Connect to the database
        const client = await pool.connect();
        const insertQuery = `
            INSERT INTO subscriptions (email, city)
            VALUES ($1, $2)
            RETURNING *;
        `;
        const result = await client.query(insertQuery, [email, city]);
         // Release database client back to pool
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

// Export the addSubscription function
module.exports = { addSubscription };

