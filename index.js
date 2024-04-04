require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

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
  
  // Define all cities with base information
  const cities = [
      { id: 1, city: 'Colombo', lat: 6.932, lng: 79.848 },
      { id: 2, city: 'Kandy', lat: 7.296, lng: 80.636 },
      { id: 3, city: 'Galle', lat: 6.037, lng: 80.217 },
      { id: 4, city: 'Jaffna', lat: 9.669, lng: 80.007 },
      { id: 5, city: 'Trincomalee', lat: 8.571, lng: 81.234 },
      { id: 6, city: 'Vavuniya', lat: 8.751, lng: 80.497 },
      // Add the rest of the cities here
  ];

  const weatherIconMapping = {
    'Sunny': 'https://cdn.worldweatheronline.com/images/wsymbols01_png_64/wsymbol_0001_sunny.png',
    'Partly cloudy': 'https://cdn.worldweatheronline.com/images/wsymbols01_png_64/wsymbol_0002_sunny_intervals.png',
    'Cloudy': 'https://cdn.worldweatheronline.com/images/wsymbols01_png_64/wsymbol_0004_black_low_cloud.png',
    'Light rain shower': 'https://cdn.worldweatheronline.com/images/wsymbols01_png_64/wsymbol_0009_light_rain_showers.png',
    'Patchy rain nearby': 'https://cdn.worldweatheronline.com/images/wsymbols01_png_64/wsymbol_0009_light_rain_showers.png'
};

const manualWeatherData = cities.map(city => {
    const descriptions = Object.keys(weatherIconMapping);
    const weatherDescriptions = descriptions[Math.floor(Math.random() * descriptions.length)];
    const weatherIcons = weatherIconMapping[weatherDescriptions];

    const temperature = Math.floor(Math.random() * 15) + 20;
    const humidity = Math.floor(Math.random() * 50) + 50;
    const airPressure = Math.floor(Math.random() * 6) + 1009;
    const windSpeed = Math.floor(Math.random() * 15) + 5;
    const isDay = true;
    const observationTime = `${Math.floor(Math.random() * 12) + 1}:00 ${Math.random() > 0.5 ? 'AM' : 'PM'}`;

    return {
        id: city.id,
        city: city.city,
        lat: city.lat,
        lng: city.lng,
        temperature,
        humidity,
        airPressure,
        windSpeed,
        weatherDescriptions,
        observationTime,
        weatherIcons,
        isDay
    };
});

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
      console.error('Failed to update weather data:', e);
      await client.query('ROLLBACK');
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
    // const weatherData = await fetchWeatherData();
    // await storeWeatherData(weatherData);
    await updateWeatherDataManually();
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
