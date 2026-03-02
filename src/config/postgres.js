const { Pool } = require('pg');
const {DATABASE_URL} = require("./env");

const pool = new Pool({
    connectionString: DATABASE_URL
});

pool.on('error', (err) => {
    console.error('[PostgreSQL] Error inesperado:', err);
});

const query = (text, params) => pool.query(text, params);
const getClient = () => pool.connect();

module.exports = { query, getClient, pool };