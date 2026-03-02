const { Router } = require('express');
const { setupTables } = require('../services/setupService');
const { migrate } = require('../services/migrate');
const { clearAll } = require('../services/clearService');

const router = Router();

// GET /api/simulacro -- info del proyecto
router.get('/', (_req, res) => {
    res.json({
        ok: true,
        project: 'SaludPlus Hybrid Persistence API',
        endpoints: [
            'POST /api/simulacro/setup -> Crea tablas en PostgreSQL',
            'POST /api/simulacro/migrate -> Migra datos del CSV a PostgreSQL y MongoDB'
        ],
    });
});

// POST /api/simulacro/setup -- crea tablas en PostgreSQL
router.post('/setup', async (_req, res) => {
    try {
        await setupTables();
        res.json({ ok: true, message: 'Tablas creadas exitosamente' });
    } catch (err) {
        console.error('[Setup Error] ', err.message);
        res.status(500).json({ ok: false, message: 'Error al crear tablas', error: err.message });
    }
});

// POST /api/simulacro/migrate
router.post('/migrate', async (req, res) => {
    try {
        const { clearBefore = false } = req.body || {};
        const result = await migrate({ clearBefore });
        res.json({
            ok: true,
            message: 'Migración completada correctamente',
            result,
        });
    } catch (err) {
        console.error('[Migration Error]', err.message);
        res.status(500).json({ ok: false, error: err.message });
    }
});

// DELETE /api/simulacro/clear
router.delete('/clear', async (_req, res) => {
    try {
        const result = await clearAll();
        res.json({ ok: true, message: 'Bases de datos limpiadas correctamente', result });
    } catch (err) {
        console.error('[Clear Error]', err.message);
        res.status(500).json({ ok: false, error: err.message });
    }
});

module.exports = router;