const express = require('express');
const router = express.Router();
const analyticsService = require('../services/analyticsService');

// GET /api/analytics/suppliers
router.get('/suppliers', async (req, res) => {
  try {
    const analysis = await analyticsService.getSupplierAnalysis();
    res.json(analysis);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/analytics/customers/:email/history
router.get('/customers/:email/history', async (req, res) => {
  try {
    const history = await analyticsService.getCustomerPurchaseHistory(req.params.email);
    res.json(history);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/analytics/products/top-by-category/:categoryName
router.get('/products/top-by-category/:categoryName', async (req, res) => {
  try {
    const topProducts = await analyticsService.getTopProductsByCategory(req.params.categoryName);
    res.json(topProducts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
