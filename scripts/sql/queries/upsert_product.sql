INSERT INTO products (product_sku, product_name, product_price, product_category_id)
VALUES ($1, $2, $3, $4)
    ON CONFLICT (product_sku) DO NOTHING
RETURNING id;