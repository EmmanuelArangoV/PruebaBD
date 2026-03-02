INSERT INTO transactions (transaction_date, transaction_code)
VALUES ($1, $2, $3, $4)
    ON CONFLICT (product_sku) DO NOTHING
RETURNING id;