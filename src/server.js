const { PORT } = require('./config/env');
const { pool } = require('./config/postgres');
const { connect: connectMongo } = require('./config/mongodb');
const app = require('./app');

const start = async () => {
    try{
        await pool.query('SELECT 1');
        console.log('[PostgreSQL] Conexión exitosa');

        await connectMongo();

        app.listen(PORT, () => {
            console.log(`[Servidor] Corriendo en http://localhost:${PORT}`);
        });
    } catch (err) {
        console.error('[Error al iniciar el servidor]', err.message);
        process.exit(1);
    }
};

start();