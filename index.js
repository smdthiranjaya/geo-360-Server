require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
// const fetch = require('node-fetch'); // Use require('node-fetch') if Node < 18, otherwise global fetch can be used directly

const app = express();
const PORT = process.env.PORT || 3000;

// PostgreSQL client setup
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function fetchWeatherData() {
  console.log('Fetching weather data...');
  const apiKey = "5ae36817ed6bfabe7ceceeb89a8e05e2";
  const cities = ["Colombo", "Kandy", "Galle"];
  const weatherData = await Promise.all(cities.map(city =>
      fetch(`http://api.weatherstack.com/current?access_key=${apiKey}&query=${city}`)
          .then(response => response.json())
  ));

  return weatherData.map((data, index) => ({
      id: index + 1,
      city: data.location.name,
      lat: parseFloat(data.location.lat),
      lng: parseFloat(data.location.lon),
      temperature: data.current.temperature,
      humidity: data.current.humidity,
      airPressure: data.current.pressure,
      windSpeed: data.current.wind_speed,
      weatherDescriptions: data.current.weather_descriptions.join(', '),
      observationTime: data.current.observation_time,
      weatherIcons: data.current.weather_icons.join(', '),
      isDay: data.current.is_day === 'yes'
  }));
}

async function storeWeatherData(weatherData) {
  console.log('Storing weather data...');
  const client = await pool.connect();
  try {
      await client.query('BEGIN');
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

// Scheduled task to run every 5 minutes
setInterval(async () => {
  try {
    const weatherData = await fetchWeatherData();
    await storeWeatherData(weatherData);
  } catch (error) {
    console.error('Failed to fetch or store weather data:', error);
  }
}, 300000); // 5 minutes

app.get('/', (req, res) => {
  res.send('Weather Data Fetching Service is running.');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
