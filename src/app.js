const express = require('express');
const simulacroRoutes = require('./routes/simulacro');
const productRoutes = require('./routes/productRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');

const app = express();

app.use(express.json());

app.use('/api/simulacro', simulacroRoutes);
app.use('/api/products', productRoutes);
app.use('/api/analytics', analyticsRoutes);

module.exports = app;