const { storeWeatherData, fetchAllWeatherData } = require('../models/weatherModel');

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
      { id: 7, city: 'Anuradhapura', lat: 8.312, lng: 80.413 },
      { id: 8, city: 'Puttalam', lat: 8.036, lng: 79.828 },
      { id: 9, city: 'Polonnaruwa', lat: 7.94, lng: 81.003 },
      { id: 10, city: 'Batticaloa', lat: 7.71, lng: 81.692 },
      { id: 11, city: 'Kurunegala', lat: 7.486, lng: 80.362 },
      { id: 12, city: 'Ratnapura', lat: 6.683, lng: 80.399 },
      { id: 13, city: 'Nuwara Eliya', lat: 6.971, lng: 80.783 },
      { id: 14, city: 'Badulla', lat: 6.99, lng: 81.056 },
      { id: 15, city: 'Pottuvil', lat: 6.876, lng: 81.827 }
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
  

  async function getWeather(req, res) {
    try {
        const weatherData = await fetchAllWeatherData();
        const response = {
            data: weatherData.map(row => ({
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
        console.error('Failed to serve weather data:', error);
        res.status(500).send('Server error');
    }
}

module.exports = { updateWeatherDataManually, getWeather };
