const express = require('express');
const router = express.Router();
const productService = require('../services/productServices');

// Obtener todos los productos (filtros category and name=...)
router.get('/', async (req, res) => {
  try {
    const products = await productService.getAllProducts(req.query);
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtener producto por SKU
router.get('/:sku', async (req, res) => {
  try {
    const product = await productService.getProductBySku(req.params.sku);
    if (!product) return res.status(404).json({ error: 'Producto no encontrado' });
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Crear producto
router.post('/', async (req, res) => {
  try {
    const product = await productService.createProduct(req.body);
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Actualizar producto
router.put('/:sku', async (req, res) => {
  try {
    const product = await productService.updateProduct(req.params.sku, req.body);
    res.json(product);
  } catch (error) {
    if (error.message === 'Producto no encontrado') {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
});

// Eliminar producto
router.delete('/:sku', async (req, res) => {
  try {
    const deleted = await productService.deleteProduct(req.params.sku);
    res.json({ message: 'Producto eliminado correctamente', product: deleted });
  } catch (error) {
    if (error.message === 'No se puede eliminar el producto porque ya tiene compras realizadas') {
      return res.status(400).json({ error: error.message });
    }
    if (error.message === 'Producto no encontrado') {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
