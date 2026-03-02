const mongoose = require('mongoose');
const { MONGODB_URI, MONGODB_DB } = require('./env');

const connect = async () => {
    await mongoose.connect(MONGODB_URI, { dbName: MONGODB_DB });
    console.log(`[MongoDB] Conectado a: ${MONGODB_DB}`);
};

module.exports = { connect };