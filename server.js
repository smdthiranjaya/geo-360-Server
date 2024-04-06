const express = require('express');
const cors = require('cors');
const { PORT } = require('./src/config');
const weatherRoutes = require('./src/routes/weatherRoutes');
const { updateWeatherDataManually } = require('./src/controllers/weatherController');
const { sendWeatherUpdates } = require('./src/services/emailService');
const swaggerUi = require('swagger-ui-express');
const swaggerDocs = require('./src/swaggerConfig');
const subscriptionRoutes = require('./src/routes/subscriptionRoutes');

// Initialize Express app
const app = express(); 
 // Enable CORS
app.use(cors());

// Parse JSON request bodies
app.use(express.json()); 
// Use weather routes
app.use(weatherRoutes);

// Root endpoint
app.get('/', (req, res) => { 
  res.send('Weather Data Fetching Service is running.');
});

// Use swagger doc routes
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs)); 
// Use subscription routes
app.use('/api', subscriptionRoutes); 

// Schedule email updates (6 hours)
setInterval(() => { 
  sendWeatherUpdates().catch(console.error);
}, 21600000);

// Schedule weather data updates (5 minutes)
setInterval(async () => { 
  try {
    await updateWeatherDataManually();
  } catch (error) {
    console.error('Failed to fetch or store weather data:', error);
  }
}, 300000);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
