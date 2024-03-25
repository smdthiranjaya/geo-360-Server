require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

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
  const cities = ["Colombo", "Kandy", "Galle", "Jaffna", "Trincomalee", "Vavuniya", "Anuradhapura", "Puttalam", "Polonnaruwa", "Batticaloa", "Kurunegala", "Ratnapura", "Nuwara Eliya", "Badulla", "Pottuvil"];
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

//use this function for temporaly to avoid weatherstack API limit exceed.
async function updateWeatherDataManually() {
  console.log('Fetching and Storing weather data...');
  const manualWeatherData = [
      { id: 1, city: 'Colombo', lat: 6.9271, lng: 79.8612, temperature: 31, humidity: 78, airPressure: 1010, windSpeed: 15, weatherDescriptions: 'Partly cloudy', observationTime: '10:00 AM', weatherIcons: 'https://cdn.worldweatheronline.com/images/wsymbols01_png_64/wsymbol_0002_sunny_intervals.png', isDay: true },
      { id: 2, city: 'Kandy', lat: 7.2906, lng: 80.6337, temperature: 25, humidity: 85, airPressure: 1012, windSpeed: 5, weatherDescriptions: 'Cloudy', observationTime: '11:00 AM', weatherIcons: 'https://cdn.worldweatheronline.com/images/wsymbols01_png_64/wsymbol_0004_black_low_cloud.png', isDay: true },
      { id: 3, city: 'Galle', lat: 6.0535, lng: 80.2210, temperature: 29, humidity: 80, airPressure: 1009, windSpeed: 10, weatherDescriptions: 'Sunny', observationTime: '09:00 AM', weatherIcons: 'https://cdn.worldweatheronline.com/images/wsymbols01_png_64/wsymbol_0001_sunny.png', isDay: true }
  ];

  const client = await pool.connect();
  try {
      await client.query('BEGIN');
      for (const data of manualWeatherData) {
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

app.get('/api/weather', async (req, res) => {
  const apiKey = req.header('X-API-Key');
  if (!apiKey || apiKey !== 'geo360apisecret') {
      return res.status(401).send('Unauthorized');
  }

  const client = await pool.connect();
  try {
      const { rows } = await client.query('SELECT * FROM weather_data');
      const response = {
          data: rows.map(row => ({
              type: 'weather',
              id: row.id,
              attributes: {
                  city: row.city,
                  latitude: row.latitude,
                  longitude: row.longitude,
                  temperature: row.temperature,
                  humidity: row.humidity,
                  air_pressure: row.air_pressure,
                  wind_speed: row.wind_speed,
                  weather_descriptions: row.weather_descriptions,
                  observation_time: row.observation_time,
                  weather_icons: row.weather_icons,
                  is_day: row.is_day,
              }
          }))
      };
      res.json(response);
  } catch (error) {
      console.error('Failed to fetch weather data:', error);
      res.status(500).send('Server error');
  } finally {
      client.release();
  }
});


// Scheduled task to run every 5 minutes
setInterval(async () => {
  try {
    const weatherData = await fetchWeatherData();
    await storeWeatherData(weatherData);
    // await updateWeatherDataManually();
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
