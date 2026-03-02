const { getClient } = require('../config/postgres');
const CustomerHistory = require('../models/CustomerHistory');
const ProductAudit = require('../models/ProductAudit');

const clearAll = async () => {
    const client = await getClient();

    try {
        await client.query('BEGIN');

        await client.query('DROP TABLE IF EXISTS transaction_details');
        await client.query('DROP TABLE IF EXISTS transactions');
        await client.query('DROP TABLE IF EXISTS product_suppliers');
        await client.query('DROP TABLE IF EXISTS products');
        await client.query('DROP TABLE IF EXISTS suppliers');
        await client.query('DROP TABLE IF EXISTS product_category');
        await client.query('DROP TABLE IF EXISTS customers');

        await CustomerHistory.deleteMany({});
        await ProductAudit.deleteMany({});

        await client.query('COMMIT');

        console.log('[Clear] Tablas eliminadas y MongoDB limpiado');

        return {
            message: 'Tablas eliminadas correctamente, corre /setup para volver a crearlas'
        };
    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
};

module.exports = { clearAll };