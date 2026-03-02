const fs = require('fs');
const path = require('path');
const { query } = require('../config/postgres');

const setupTables = async () => {
    const sql = fs.readFileSync(
        path.join(__dirname, '../../scripts/sql/setup.sql'),
        'utf-8'
    );

    await query(sql);
    console.log('[Setup] Tablas creadas exitosamente');
};

module.exports = { setupTables };