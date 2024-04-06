const express = require('express');
const { getWeather } = require('../controllers/weatherController');
const router = express.Router();

// Define a GET route for fetching weather data
router.get('/api/weather', getWeather);

// Swagger documentation for the /api/weather endpoint
/**
 * @swagger
 * /api/weather:
 *   get:
 *     summary: Retrieves weather data from heroku postgresql db.
 *     description: Fetches weather data for all cities.
 *     responses:
 *       200:
 *         description: A list of weather data.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Weather'
 * components:
 *   schemas:
 *     Weather:
 *       type: object
 *       required:
 *         - city
 *         - temperature
 *       properties:
 *         city:
 *           type: string
 *           description: The city's name
 *         temperature:
 *           type: integer
 *           description: The current temperature
 */

module.exports = router;
