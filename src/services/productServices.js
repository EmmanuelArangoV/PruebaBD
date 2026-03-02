const { query } = require('../config/postgres');
const ProductAudit = require('../models/ProductAudit');

const getAllProducts = async ({ category, name } = {}) => {
  let sql = `
    SELECT p.*, c.category_name 
    FROM products p
    JOIN product_category c ON p.product_category_id = c.id
    WHERE 1=1
  `;
  const params = [];

  if (category) {
    params.push(`%${category}%`);
    sql += ` AND c.category_name ILIKE $${params.length}`;
  }

  if (name) {
    params.push(`%${name}%`);
    sql += ` AND p.product_name ILIKE $${params.length}`;
  }

  const result = await query(sql, params);
  return result.rows;
};

/* Obtener producto por SKU. */
const getProductBySku = async (sku) => {
  const sql = `
    SELECT p.*, c.category_name 
    FROM products p
    JOIN product_category c ON p.product_category_id = c.id
    WHERE p.product_sku = $1
  `;
  const result = await query(sql, [sku]);
  return result.rows[0];
};

/* Crear un nuevo producto. */
const createProduct = async (productData) => {
  const { sku, name, price, category_id } = productData;
  const sql = `
    INSERT INTO products (product_sku, product_name, product_price, product_category_id)
    VALUES ($1, $2, $3, $4)
    RETURNING *
  `;
  const result = await query(sql, [sku, name, price, category_id]);
  return result.rows[0];
};


/* Actualizar producto. Si el precio cambia, se guarda trazabilidad en MongoDB. */
const updateProduct = async (sku, productData) => {
  const { name, price, category_id } = productData;
  
  // 1. Obtener datos actuales para comparar precio
  const currentProduct = await getProductBySku(sku);
  if (!currentProduct) {
    throw new Error('Producto no encontrado');
  }

  // 2. Si el precio cambia, registrar en MongoDB para trazabilidad
  if (price !== undefined && parseFloat(price) !== parseFloat(currentProduct.product_price)) {
    await ProductAudit.create({
      productId: sku,
      action: 'PRICE_CHANGE',
      oldPrice: currentProduct.product_price,
      newPrice: price,
      productData: currentProduct
    });
  }

  // 3. Actualizar en SQL
  const sql = `
    UPDATE products 
    SET product_name = COALESCE($1, product_name),
        product_price = COALESCE($2, product_price),
        product_category_id = COALESCE($3, product_category_id)
    WHERE product_sku = $4
    RETURNING *
  `;
  const result = await query(sql, [name, price, category_id, sku]);
  return result.rows[0];
};


/* Eliminar producto, estoy validando si tiene compras y guarda log en MongoDB. */
const deleteProduct = async (sku) => {

  // 1. Verificar si tiene compras realizadas
  const checkSalesSql = `
    SELECT COUNT(*) as count 
    FROM transaction_details td
    JOIN product_suppliers ps ON td.product_id_supplier = ps.id
    JOIN products p ON ps.product_id = p.id
    WHERE p.product_sku = $1
  `;
  const salesResult = await query(checkSalesSql, [sku]);
  
  if (parseInt(salesResult.rows[0].count) > 0) {
    throw new Error('No se puede eliminar el producto porque ya tiene compras realizadas');
  }

  // 2. Obtener datos antes de borrar para el log
  const productToDelete = await getProductBySku(sku);
  if (!productToDelete) {
    throw new Error('Producto no encontrado');
  }

  // 3. Registrar en MongoDB
  await ProductAudit.create({
    productId: sku,
    action: 'DELETE',
    productData: productToDelete
  });

  // 4. Borrar relaciones en product_suppliers primero.
  await query('DELETE FROM product_suppliers WHERE product_id = (SELECT id FROM products WHERE product_sku = $1)', [sku]);

  // 5. Borrar producto en SQL
  const deleteSql = 'DELETE FROM products WHERE product_sku = $1 RETURNING *';
  const result = await query(deleteSql, [sku]);
  
  return result.rows[0];
};

module.exports = {
  getAllProducts,
  getProductBySku,
  createProduct,
  updateProduct,
  deleteProduct
};
