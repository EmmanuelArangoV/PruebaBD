INSERT INTO product_category (category_name)
VALUES ($1)
ON CONFLICT (category_name) DO NOTHING
RETURNING id;