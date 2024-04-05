const swaggerJsDoc = require('swagger-jsdoc');

const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Geo 360 Live Weather API',
            version: '1.0.0',
            description: 'A simple Express Weather API'
        },
        servers: [
            {
                url: 'https://www.geo360live.tech'
            }
        ],
    },
    apis: ['./src/routes/*.js'], 
};

module.exports = swaggerJsDoc(swaggerOptions);
