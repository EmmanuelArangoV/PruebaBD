const customerHistory = require('../models/CustomerHistory');

/* HELPERS */
const capitalize = (str = '') => {
    return str
        .trim()
        .toLowerCase()
        .replace(/\b\w/g, (letra) => letra.toUpperCase());
};

const normalizeEmail = (str = '') => {
    return str.trim().toLowerCase();
};

/* UPSERT FUNCTIONS */

const upsertCustomerHistory = async (row) => {
    const [name, ...lastParts] = capitalize(row.customer_name).split(' ');
    const lastName = lastParts.join(' ') || 'Unknown';
    const email = normalizeEmail(row.customer_email);

    const quantity = parseInt(row.quantity) || 0;
    const unitPrice = parseFloat(row.unit_price) || 0;
    const totalLineValue = (row.total_line_value && parseFloat(row.total_line_value) !== 0) 
        ? parseFloat(row.total_line_value) 
        : (quantity * unitPrice);

    const product = {
        sku:              row.product_sku,
        name:             capitalize(row.product_name),
        quantity:         quantity,
        unit_price:       unitPrice,
        total_line_value: totalLineValue,
    };

    // Buscamos si el cliente ya tiene esta transacción en su historial
    const customer = await customerHistory.findOne({ email, 'history.transaction_id': row.transaction_id });

    if (customer) {
        // Si la transacción ya existe, añadimos el producto a esa transacción específica
        await customerHistory.updateOne(
            { email, 'history.transaction_id': row.transaction_id },
            {
                $push: { 'history.$.products': product },
                $inc:  { 'history.$.total': product.total_line_value }
            }
        );
    } else {
        // Si la transacción no existe o el cliente es nuevo, creamos/actualizamos los datos del cliente
        // y añadimos una nueva transacción al historial
        const newTransaction = {
            transaction_id: row.transaction_id,
            date:           new Date(row.date),
            products:       [product],
            total:          product.total_line_value
        };

        await customerHistory.updateOne(
            { email },
            {
                $set: {
                    name,
                    last_name: lastName,
                    phone:     row.customer_phone,
                    address:   row.customer_address
                },
                $push: { history: newTransaction }
            },
            { upsert: true }
        );
    }
};

module.exports = {
    upsertCustomerHistory
};