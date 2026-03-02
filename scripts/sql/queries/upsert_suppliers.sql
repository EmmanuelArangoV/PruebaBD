INSERT INTO suppliers (name, email)
VALUES ($1, $2)
ON CONFLICT (email) DO NOTHING
RETURNING id;