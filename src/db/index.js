const { Pool } = require('pg');
const { DATABASE_URL } = require('../config');

// Create a new pool instance with connection settings
const pool = new Pool({
  // Use the DATABASE_URL for connection string
  connectionString: DATABASE_URL,
  // Disable SSL to allow connections from localhost
  ssl: {
    rejectUnauthorized: false
  }
});

// Export the pool for database operations elsewhere in the application
module.exports = pool;
