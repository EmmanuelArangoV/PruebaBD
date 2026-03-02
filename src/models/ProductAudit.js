const mongoose = require('mongoose');

const productAuditSchema = new mongoose.Schema({
  productId: { type: String, required: true },
  action: { type: String, enum: ['DELETE', 'PRICE_CHANGE'], required: true },
  oldPrice: { type: Number },
  newPrice: { type: Number },
  productData: { type: Object },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ProductAudit', productAuditSchema);
