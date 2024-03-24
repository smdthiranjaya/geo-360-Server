require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const fetch = require('node-fetch'); // Use require('node-fetch') if Node < 18, otherwise global fetch can be used directly

const app = express();
const PORT = process.env.PORT || 3000;

// PostgreSQL client setup
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Example function to fetch weather data
async function fetchWeatherData() {
  // Here, you'd call the weather API. This is a placeholder.
  console.log('Fetching weather data...');
  // Example: const response = await fetch('API_URL');
  // const data = await response.json();
  // return data;
}

// Example function to store data in the database
async function storeWeatherData() {
  // This is a placeholder. You would interact with the database here.
  console.log('Storing weather data...');
}

// Scheduled task to run every 5 minutes
setInterval(async () => {
  try {
    const weatherData = await fetchWeatherData();
    await storeWeatherData(weatherData);
  } catch (error) {
    console.error('Failed to fetch or store weather data:', error);
  }
}, 60000); // 5 minutes

app.get('/', (req, res) => {
  res.send('Weather Data Fetching Service is running.');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
