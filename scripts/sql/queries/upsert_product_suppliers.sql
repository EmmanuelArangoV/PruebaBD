INSERT INTO product_suppliers (product_id, supplier_id)
VALUES ($1, $2)
RETURNING id;