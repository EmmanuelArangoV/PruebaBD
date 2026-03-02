const path = require('path');
const { getClient } = require('../config/postgres');
const { CSV_PATH } = require('../config/env');
const { 
    parseCSV, 
    upsertCustomer, 
    upsertCategory, 
    upsertSupplier, 
    upsertProductSupplier, 
    upsertTransaction, 
    upsertTransactionDetails, 
    upsertProduct  
} = require('./sqlMigration');
const { upsertCustomerHistory } = require('./mongoMigration');
const CustomerHistory = require('../models/CustomerHistory');

const migrate = async({ clearBefore = false } = {}) => {
    const csvPath = path.resolve(CSV_PATH);

    // 1. Leer el CSV
    const rows = await parseCSV(csvPath);
    console.log(`[Migración] ${rows.length} filas leídas del CSV`);

    // 2. Obtener cliente
    const client = await getClient();

    try {
        await client.query('BEGIN');

        // 3. si clearBefore, limpiar tablas SQL
        if (clearBefore) {
            await client.query('DELETE FROM transaction_details');
            await client.query('DELETE FROM transactions');
            await client.query('DELETE FROM product_suppliers');
            await client.query('DELETE FROM products');
            await client.query('DELETE FROM suppliers');
            await client.query('DELETE FROM product_category');
            await client.query('DELETE FROM customers');
            await CustomerHistory.deleteMany({});
            console.log('[Migración] Tablas SQL limpiadas');
        }

        // 4. Sets para estadísticas
        const customerIds = new Set();
        const productIds = new Set();
        const transactionIds = new Set();

        // 5. Procesar cada fila
        for (const row of rows) {
            const customerId = await upsertCustomer(client, row);
            const categoryId = await upsertCategory(client, row);
            const supplierId = await upsertSupplier(client, row);
            const productId = await upsertProduct(client, row, categoryId);
            
            const productSupplierId = await upsertProductSupplier(client, row, productId, supplierId);
            const transactionId = await upsertTransaction(client, row, customerId);
            await upsertTransactionDetails(client, row, transactionId, productSupplierId);

            // Migración a MongoDB
            await upsertCustomerHistory(row);

            customerIds.add(customerId);
            productIds.add(productId);
            transactionIds.add(transactionId);
        }

        // 6. Commit
        await client.query('COMMIT');
        console.log('[Migración] Migración completada exitosamente');

        const stats = {
            customers: customerIds.size,
            products: productIds.size,
            transactions: transactionIds.size,
            rowsProcessed: rows.length
        };
        console.log('[Migración] Estadísticas:', stats);
        return stats;

    } catch (err) {
        await client.query('ROLLBACK');
        console.error('[Migración] Error en la migración:', err);
        throw err;
    } finally {
        // Volver el cliente al pool
        client.release();
    }
};

module.exports = { migrate };
