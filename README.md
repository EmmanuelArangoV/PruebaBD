# SaludPlus Hybrid Persistence API

This project is a hybrid persistence system using **PostgreSQL** for relational data and **MongoDB** for historical/document-based data. It provides a robust API to manage products, customers, and transactions, including a massive migration script from CSV data.

## Features

- **Hybrid Storage**: SQL (PostgreSQL) for transactional integrity and NoSQL (MongoDB) for high-performance retrieval of customer history and audit logs.
- **Massive Migration**: Automated script to ingest data from CSV into both databases.
- **RESTful API**: Full CRUD operations for products and specialized endpoints for analytics and data management.
- **Dockerized Environment**: Easy setup using Docker Compose.

---

## Getting Started

### Prerequisites

- [Docker](https://www.docker.com/) and [Docker Compose](https://docs.docker.com/compose/)
- [Node.js](https://nodejs.org/) (v16+ recommended)
- [npm](https://www.npmjs.com/)

### Installation & Local Deployment

1. **Clone the repository**:
   ```bash
   git clone https://github.com/EmmanuelArangoV/PruebaBD.git
   cd PruebaBD
   ```

2. **Set up Environment Variables**:
   Create a `.env` file in the root directory based on the following template:
   ```env
   PORT=3000
   DATABASE_URL=postgres://postgres:postgres@localhost:5432/megastore
   MONGODB_URI=mongodb://localhost:27017/megastore
   MONGODB_DB=megastore
   CSV_PATH=./data/data_simulation.csv
   ```

3. **Start Databases**:
   Use Docker Compose to spin up PostgreSQL and MongoDB:
   ```bash
   docker-compose up -d
   ```

4. **Install Dependencies**:
   ```bash
   npm install
   ```

5. **Run the Application**:
   ```bash
   # Development mode
   npm run dev

   # Production mode
   npm start
   ```

---

## Database Model Justification

### SQL (PostgreSQL): Normalization
The relational schema follows the **Third Normal Form (3NF)** to ensure data integrity and minimize redundancy:
- **Normalization Process**: 
    - Entities like `customers`, `products`, `suppliers`, and `product_category` are separated into their own tables.
    - Many-to-Many relationships (e.g., Products and Suppliers) are resolved using a join table (`product_suppliers`).
    - Transactional data is split into `transactions` (header) and `transaction_details` (lines) to maintain a clear hierarchy and support complex queries/reporting.
- **Why SQL?**: Essential for maintaining ACID properties during financial transactions and ensuring consistent relations between products, categories, and inventory.

### NoSQL (MongoDB): Embedding vs. Referencing
In MongoDB, we use an **Embedded Document** strategy for the `CustomerHistory` collection and audit logs.
- **Why Embedding?**: 
    - **Read Performance**: By embedding transactions and their products directly into the customer document, we can retrieve a customer's entire purchase history with a single query, avoiding expensive `$lookup` (joins).
    - **Data Locality**: Historical data is often accessed together. Since the history of a purchase doesn't change once completed, embedding provides a "snapshot" that is fast to access and serves the specific use case of a "Customer Dashboard".
- **Why not Referencing?**: Referencing would require multiple round-trips to the database to reconstruct the history, which is less efficient for this specific analytical/historical requirement.

---

## Massive Migration Guide

The project includes a specialized endpoint to populate the databases from a CSV file located at the path defined in `CSV_PATH`.

### Steps to Migrate:

1. **Prepare the Environment**: Ensure PostgreSQL tables are created.
   ```bash
   POST http://localhost:3000/api/simulacro/setup
   ```

2. **Run Migration**: Execute the migration script.
   ```bash
   POST http://localhost:3000/api/simulacro/migrate
   ```
   *Optional*: You can send `{ "clearBefore": true }` in the JSON body to wipe existing data before migrating.

3. **Verification**: The migration process logs progress to the console. Once finished, it returns a summary of processed records.

---

## API Endpoints

### Project Management (`/api/simulacro`)
- `GET /`: Returns project info and available management endpoints.
- `POST /setup`: Initializes the PostgreSQL schema (creates tables).
- `POST /migrate`: Triggers the CSV-to-DB migration process.
- `DELETE /clear`: Wipes all data from both PostgreSQL and MongoDB.

### Products (`/api/products`)
- `GET /`: Retrieve all products (supports query params for filtering by `category` or `name`).
- `GET /:sku`: Get a specific product by its SKU.
- `POST /`: Create a new product.
- `PUT /:sku`: Update an existing product.
- `DELETE /:sku`: Delete a product (fails if the product has associated transactions).

### Analytics (`/api/analytics`)
- `GET /suppliers`: Detailed analysis of suppliers (total items sold and inventory value).
- `GET /customers/:email/history`: Complete purchase history for a specific customer.
- `GET /products/top-by-category/:categoryName`: Top products by revenue in a specific category.

---

## Project Structure
```text
PruebaBD/
├── data/                 # CSV data source
├── scripts/
│   └── sql/              # SQL setup and upsert queries
├── src/
│   ├── config/           # Database and Env configurations
│   ├── models/           # Mongoose schemas (MongoDB)
│   ├── routes/           # Express routes (Simulacro, Products, Analytics)
│   ├── services/         # Business logic, Migration & Analytics services
│   ├── app.js            # Express app setup
│   └── server.js         # Entry point
├── docker-compose.yml    # Infrastructure
└── .env                  # Configuration (not committed)
```
