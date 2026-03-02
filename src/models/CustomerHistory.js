const mongoose = require('mongoose');

//Schema para cada producto vendido en una compra
const productSchema = new mongoose.Schema({
    sku: { type: String, required: true },
    name: { type: String, required: true },
    quantity: { type: Number, required: true },
    unit_price: { type: Number, required: true },
    total_line_value: { type: Number, required: true }
}, {_id: false});

//Schema para cada transaccion
const transactionSchema = new mongoose.Schema({
    transaction_id: { type: String, required: true },
    date: { type: Date, required: true },
    products: { type: [productSchema], default: []},
    total: { type: Number, required: true}
}, {_id: false});

//Schema para cada cliente
const clientSchema = new mongoose.Schema({
    name: { type: String, required: true },
    last_name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String },
    address: { type: String },
    history: { type: [transactionSchema], default: [] }
}, { timestamps: true });

module.exports = mongoose.model('CustomerHistory', clientSchema);