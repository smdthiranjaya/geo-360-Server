const express = require('express');
const cors = require('cors');
const { PORT } = require('./src/config');
const weatherRoutes = require('./src/routes/weatherRoutes');
const { updateWeatherDataManually } = require('./src/controllers/weatherController');
const { sendWeatherUpdates } = require('./src/services/emailService');
const swaggerUi = require('swagger-ui-express');
const swaggerDocs = require('./src/swaggerConfig');
const subscriptionRoutes = require('./src/routes/subscriptionRoutes');

const app = express();
app.use(cors());

app.use(weatherRoutes);

app.get('/', (req, res) => {
  res.send('Weather Data Fetching Service is running.');
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));
app.use('/api', subscriptionRoutes);

setInterval(() => {
  sendWeatherUpdates().catch(console.error);
}, 300000); // 24 hours in milliseconds

setInterval(async () => {
  try {
    await updateWeatherDataManually();
  } catch (error) {
    console.error('Failed to fetch or store weather data:', error);
  }
}, 300000); // 5 minutes

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
