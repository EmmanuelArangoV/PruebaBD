INSERT INTO customers (name, last_name, email, phone, address)
VALUES ($1, $2, $3, $4, $5)
ON CONFLICT (email) DO NOTHING
RETURNING id;