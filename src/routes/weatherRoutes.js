const express = require('express');
const { getWeather } = require('../controllers/weatherController');
const router = express.Router();

router.get('/api/weather', getWeather);

/**
 * @swagger
 * /api/weather:
 *   get:
 *     summary: Retrieves weather data
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
