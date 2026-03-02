const { query } = require('../config/postgres');

const getSupplierAnalysis = async () => {
  const sql = `
    SELECT 
      s.id,
      s.name as supplier_name,
      SUM(td.quantity) as total_items_sold,
      (
        SELECT SUM(p2.product_price) 
        FROM products p2
        JOIN product_suppliers ps2 ON p2.id = ps2.product_id
        WHERE ps2.supplier_id = s.id
      ) as total_inventory_value
    FROM suppliers s
    LEFT JOIN product_suppliers ps ON s.id = ps.supplier_id
    LEFT JOIN transaction_details td ON ps.id = td.product_id_supplier
    GROUP BY s.id, s.name
    ORDER BY total_items_sold DESC NULLS LAST;
  `;
  const result = await query(sql);
  return result.rows;
};

const getCustomerPurchaseHistory = async (email) => {
  const sql = `
    SELECT 
      t.transaction_code,
      t.transaction_date,
      SUM(td.total_line_price) as transaction_total_spent,
      json_agg(
        json_build_object(
          'product_name', p.product_name,
          'product_sku', p.product_sku,
          'quantity', td.quantity,
          'total_line_price', td.total_line_price
        )
      ) as products
    FROM customers c
    JOIN transactions t ON c.id = t.customer_id
    JOIN transaction_details td ON t.id = td.transaction_id
    JOIN product_suppliers ps ON td.product_id_supplier = ps.id
    JOIN products p ON ps.product_id = p.id
    WHERE c.email = $1
    GROUP BY t.id, t.transaction_code, t.transaction_date
    ORDER BY t.transaction_date DESC, t.id;
  `;
  const result = await query(sql, [email]);
  return result.rows;
};

const getTopProductsByCategory = async (categoryName) => {
  const sql = `
    SELECT 
      p.id,
      p.product_sku,
      p.product_name,
      SUM(td.quantity) as total_quantity_sold,
      SUM(td.total_line_price) as total_revenue
    FROM products p
    JOIN product_category pc ON p.product_category_id = pc.id
    JOIN product_suppliers ps ON p.id = ps.product_id
    JOIN transaction_details td ON ps.id = td.product_id_supplier
    WHERE pc.category_name = $1
    GROUP BY p.id, p.product_sku, p.product_name
    ORDER BY total_revenue DESC;
  `;
  const result = await query(sql, [categoryName]);
  return result.rows;
};

module.exports = {
  getSupplierAnalysis,
  getCustomerPurchaseHistory,
  getTopProductsByCategory
};
