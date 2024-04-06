
const nodemailer = require('nodemailer');
const pool = require('../db');

// Asynchronously send weather updates to all subscribers
async function sendWeatherUpdates() {
    const client = await pool.connect();
    try {
        // Retrieve a list of distinct cities from subscriptions
        const { rows: subscriptions } = await client.query('SELECT DISTINCT city FROM subscriptions;');
        // Iterate over each city to fetch and send weather updates
        for (const { city } of subscriptions) {
            // Fetch weather data for the current city
            const weatherData = await fetchWeatherDataForCity(city); 
            // Retrieve all email addresses subscribed to the current city
            const { rows: subscribers } = await client.query('SELECT email FROM subscriptions WHERE city = $1;', [city]);
            // Send an email with weather data to each subscriber
            for (const { email } of subscribers) {
                await sendEmail(email, city, weatherData);
            }
        }
    } catch (error) {
        console.error('Failed to send weather updates:', error);
    } finally {
        client.release();
    }
}

// Asynchronously fetch weather data for a specific city
async function fetchWeatherDataForCity(city) {
    const client = await pool.connect();
    try {
        // SQL query to select temperature stats for the specified city
        const query = `
            SELECT MAX(temperature) AS max_temp, MIN(temperature) AS min_temp, AVG(temperature) AS avg_temp
            FROM weather_data
            WHERE city = $1;
        `;
        // Execute the query and return the result
        const result = await client.query(query, [city]);
        return result.rows[0]; 
    } catch (error) {
        console.error(`Failed to fetch weather data for city ${city}:`, error);
        throw error; 
    } finally {
        client.release();
    }
}

// Asynchronously send an email to a recipient with weather data for a city
async function sendEmail(recipient, city, weatherData) {
     // Configure nodemailer with email service and authentication details
    let transporter = nodemailer.createTransport({
        service: 'gmail', 
        auth: {
            user: 'geo360.live@gmail.com',
            pass: 'aymj fcyu udnc ghpd'
        }
    });

    // Set up email options including recipient, subject, and body
    let mailOptions = {
        from: 'geo360.live@gmail.com',
        to: recipient,
        subject: `Weather Update for ${city}`,
        text: `Good day! ✨
            
            Here's your latest weather update for ${city}:
            
            🔺 - Maximum Temperature: ${weatherData.max_temp}°C
            🔻 - Minimum Temperature: ${weatherData.min_temp}°C
            🔍 - Average Temperature: ${parseFloat(weatherData.avg_temp).toFixed(2)}°C
            
            Stay informed and plan your day accordingly!
            
            Best,
            Geo360 Team.`
    };

    // Send the email and log the result or error
    transporter.sendMail(mailOptions, function(error, info){
        if (error) {
            console.log('Email send error:', error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
}

module.exports = { sendWeatherUpdates };
