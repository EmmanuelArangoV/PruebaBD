const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

const loadQuery = (filename) => {
    return fs.readFileSync(
        path.join(__dirname, '../../scripts/sql/queries', filename),
        'utf-8'
    );
};

const SQL = {
    upsertCategory: loadQuery('upsert_category.sql'),
    upsertCustomer: loadQuery('upsert_customer.sql'),
    upsertProduct: loadQuery('upsert_product.sql'),
    upsertProductSupplier: loadQuery('upsert_product_suppliers.sql'),
    upsertSupplier: loadQuery('upsert_suppliers.sql'),
    upsertTransaction: loadQuery('upsert_transaction.sql'),
    upsertTransactionDetails: loadQuery('upsert_transaction_details.sql')
}

/* ----- HELPER FUNCTIONS ----- */

const capitalize = (str = '') => {
    return str
        .trim()
        .toLowerCase()
        .replace(/\b\w/g, (letra) => letra.toUpperCase());
};

const normalizeEmail = (str = '') => {
    return str.trim().toLowerCase();
};

/* ----- READ CSV ----- */

const parseCSV = (filePath) => {
    return new Promise((resolve, reject) => {
        const rows = [];
        fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', (row) => {
                rows.push(row);
            })
            .on('end', () => {
                resolve(rows);
            })
            .on('error', (error) => {
                reject(error);
            });
    });
};

/* ----- UPSERT FUNCTIONS ----- */

const upsertCustomer = async (client, row) => {
    const [name, ...lastParts] = capitalize(row.customer_name).split(' ');
    const last_name = lastParts.join(' ') || 'Unknown';
    const email = normalizeEmail(row.customer_email);

    const result = await client.query(SQL.upsertCustomer, [
        name,
        last_name,
        email,
        row.customer_phone,
        row. customer_address
    ]);

    if (result.rows.length === 0) {
        const existing = await client.query(
            'SELECT id FROM customers WHERE email = $1',
            [email]
        );
        return existing.rows[0].id;
    }

    return result.rows[0].id;
};

const upsertCategory = async (client, row) => {
    const name = capitalize(row.product_category);

    const result = await client.query(SQL.upsertCategory, [name]);

    if (result.rows.length === 0) {
        const existing = await client.query(
            'SELECT id FROM product_category WHERE category_name = $1',
            [name]
        );
        return existing.rows[0].id;
    }

    return result.rows[0].id;
}

const upsertSupplier = async (client, row) => {
    const name = capitalize(row.supplier_name);
    const email = normalizeEmail(row.supplier_email);

    const result = await client.query(SQL.upsertSupplier, [name, email]);

    if (result.rows.length === 0) {
        const existing = await client.query(
            'SELECT id FROM suppliers WHERE email = $1',
            [email]
        );
        return existing.rows[0].id;
    }

    return result.rows[0].id;
}

const upsertProduct = async (client, row, product_category) => {
    const name = capitalize(row.product_name);

    const result = await client.query(SQL.upsertProduct, [
        row.product_sku,
        name,
        row.unit_price,
        product_category
    ]);

    if (result.rows.length === 0) {
        const existing = await client.query(
            'SELECT id FROM products WHERE product_sku = $1',
            [row.product_sku]
        );
        return existing.rows[0].id;
    }
    return result.rows[0].id;
}

const upsertProductSupplier = async (client, row, product, supplier) => {
    const result = await client.query(SQL.upsertProductSupplier, [product, supplier]);

    if (result.rows.length === 0) {
        const existing = await client.query(
            'SELECT id FROM product_suppliers WHERE product_id = $1 AND supplier_id = $2'  ,
            [product, supplier]
        );
        return existing.rows[0].id;
    }
    return result.rows[0].id;
}

const upsertTransaction = async (client, row, customer) => {
    const result = await client.query(SQL.upsertTransaction, [
        row.date,
        row.transaction_id,
        customer
    ]);

    if (result.rows.length === 0) {
        const existing = await client.query(
            'SELECT id FROM transactions WHERE transaction_code = $1'  ,
            [row.transaction_id]
        );
        return existing.rows[0].id;
    }
    return result.rows[0].id;
}

const upsertTransactionDetails = async (client, row, transaction, productSupplierId) => {
    await client.query(SQL.upsertTransactionDetails, [
        transaction,
        productSupplierId,
        row.quantity,
        row.total_line_value
    ]);
}

module.exports = {
    parseCSV,
    upsertCustomer,
    upsertCategory,
    upsertSupplier,
    upsertProductSupplier,
    upsertTransaction,
    upsertTransactionDetails,
    upsertProduct
};