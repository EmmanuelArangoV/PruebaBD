INSERT INTO transactions_details (transaction_id, product_id_supplier, quantity, total_line_price)
VALUES ($1, $2, $3, $4)
    ON CONFLICT (transaction_details_unique) DO NOTHING