
const nodemailer = require('nodemailer');
const pool = require('../db');

async function sendWeatherUpdates() {
    const client = await pool.connect();
    try {
        const { rows: subscriptions } = await client.query('SELECT DISTINCT city FROM subscriptions;');
        for (const { city } of subscriptions) {
            const weatherData = await fetchWeatherDataForCity(city); 
            const { rows: subscribers } = await client.query('SELECT email FROM subscriptions WHERE city = $1;', [city]);
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

async function fetchWeatherDataForCity(city) {
    const client = await pool.connect();
    try {
        const query = `
            SELECT MAX(temperature) AS max_temp, MIN(temperature) AS min_temp, AVG(temperature) AS avg_temp
            FROM weather_data
            WHERE city = $1;
        `;
        const result = await client.query(query, [city]);
        return result.rows[0]; 
    } catch (error) {
        console.error(`Failed to fetch weather data for city ${city}:`, error);
        throw error; 
    } finally {
        client.release();
    }
}


async function sendEmail(recipient, city, weatherData) {
    let transporter = nodemailer.createTransport({
        service: 'gmail', 
        auth: {
            user: 'geo360.live@gmail.com',
            pass: 'aymj fcyu udnc ghpd'
        }
    });

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

    transporter.sendMail(mailOptions, function(error, info){
        if (error) {
            console.log('Email send error:', error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
}

module.exports = { sendWeatherUpdates };
