INSERT INTO transactions (transaction_date, transaction_code, customer_id)
VALUES ($1, $2, $3)
    ON CONFLICT (transaction_code) DO NOTHING
RETURNING id;