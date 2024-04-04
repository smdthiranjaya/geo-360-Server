const { Pool } = require('pg');
const { DATABASE_URL } = require('../config');

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

module.exports = pool;
