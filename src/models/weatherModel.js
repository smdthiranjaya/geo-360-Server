const pool = require('../db');

// Function to store multiple weather data entries into the database
async function storeWeatherData(weatherData) {
    console.log('Storing weather data...');
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        // Prepare and execute SQL to insert or update weather data for each entry
        for (const data of weatherData) {
            const insertQuery = `
                INSERT INTO weather_data (id, city, latitude, longitude, temperature, humidity, air_pressure, wind_speed, weather_descriptions, observation_time, weather_icons, is_day)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
                ON CONFLICT (id) DO UPDATE 
                SET temperature = EXCLUDED.temperature,
                    humidity = EXCLUDED.humidity,
                    air_pressure = EXCLUDED.air_pressure,
                    wind_speed = EXCLUDED.wind_speed,
                    weather_descriptions = EXCLUDED.weather_descriptions,
                    observation_time = EXCLUDED.observation_time,
                    weather_icons = EXCLUDED.weather_icons,
                    is_day = EXCLUDED.is_day;
            `;
            const values = [
                data.id, data.city, data.lat, data.lng, data.temperature, data.humidity, 
                data.airPressure, data.windSpeed, data.weatherDescriptions, data.observationTime, 
                data.weatherIcons, data.isDay
            ];
            await client.query(insertQuery, values);
        }
        await client.query('COMMIT');
    } catch (e) {
        await client.query('ROLLBACK');
        throw e;
    } finally {
        client.release();
    }
  }
  
  // Function to fetch all weather data from the database
  async function fetchAllWeatherData() {
    const client = await pool.connect();
    try {
        // Execute a SELECT query to fetch all weather data
        const { rows } = await client.query('SELECT * FROM weather_data');
        return rows;
    } catch (error) {
        console.error('Failed to fetch weather data:', error);
        throw error;
    } finally {
        client.release();
    }
}

// Export the functions for external use
module.exports = { storeWeatherData, fetchAllWeatherData };
