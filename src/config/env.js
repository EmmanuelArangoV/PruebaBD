require('dotenv').config();

const required = ['DATABASE_URL', 'MONGODB_URI', 'MONGODB_DB'];

for (const key of required) {
    if (!process.env[key]) {
        throw new Error(`Missing required enviroment variable: ${key}`);
    }
}

module.exports = {
    PORT: process.env.PORT || 3000,
    DATABASE_URL: process.env.DATABASE_URL,
    MONGODB_URI: process.env.MONGODB_URI,
    MONGODB_DB: process.env.MONGODB_DB,
    CSV_PATH: process.env.CSV_PATH || './data/data_simulation.csv',
};