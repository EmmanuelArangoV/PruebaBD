const path = require('path');
const { getCLient } = require('../config/postgres');
const { CSV_PATH } = require('../config/env');
const { parseCSV, upsertCustomer, upsertCategory, upsertSupplier, upsertProductSupplier, upsertTransaction, upsertTransactionDetails } = require('./sqlMigration');

const migrate = async({ clearBefore = false} = {}) => {
    const csvPath = path.resolve(CSV_PATH);

    // 1. Leer el CSV
    const rows = await parseCSV(csvPath);
    console.log(`[Migración] ${rows.length} filas leídas del CSV`);
}