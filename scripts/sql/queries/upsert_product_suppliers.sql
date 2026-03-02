INSERT INTO product_suppliers (product_id, supplier_id)
VALUES ($1, $2)
    ON CONFLICT (product_supplier_unique) DO NOTHING
RETURNING id;