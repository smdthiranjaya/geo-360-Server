const swaggerJsDoc = require('swagger-jsdoc');

// Define Swagger options for API documentation
const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        // Provide basic information about the API (title, version, description)
        info: {
            title: 'Geo 360 Live Weather API',
            version: '1.0.0',
            description: 'A simple Express Weather API'
        },
        // Define the server(s) the API is available on
        servers: [
            {
                url: 'https://www.geo360live.tech'
            }
        ],
    },
    // Specify the path(s) to files containing Swagger annotations for routes
    apis: ['./src/routes/*.js'], 
};

module.exports = swaggerJsDoc(swaggerOptions);