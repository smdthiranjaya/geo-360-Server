// src/services/emailService.js
const nodemailer = require('nodemailer');
const { pool } = require('../db');

async function sendWeatherUpdates() {
    const client = await pool.connect();
    try {
        const { rows: subscriptions } = await client.query('SELECT DISTINCT city FROM subscriptions;');
        for (const { city } of subscriptions) {
            const weatherData = await fetchWeatherDataForCity(city); // Implement this function based on your needs
            const { rows: subscribers } = await client.query('SELECT email FROM subscriptions WHERE city = $1;', [city]);
            for (const { email } of subscribers) {
                await sendEmail(email, city, weatherData); // Implement sendEmail function
            }
        }
    } catch (error) {
        console.error('Failed to send weather updates:', error);
    } finally {
        client.release();
    }
}

// Example sendEmail function
async function sendEmail(recipient, city, weatherData) {
    let transporter = nodemailer.createTransport({
        service: 'gmail', // Example with Gmail; configure as needed
        auth: {
            user: 'geo360.live@gmail.com',
            pass: 'geo360live#540'
        }
    });

    let mailOptions = {
        from: 'geo360live#540',
        to: recipient,
        subject: `Daily Weather Update for ${city}`,
        text: `Here's the weather update for ${city}: ${JSON.stringify(weatherData)}`
    };

    transporter.sendMail(mailOptions, function(error, info){
        if (error) {
            console.log('Email send error:', error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
}

module.exports = { sendWeatherUpdates };
