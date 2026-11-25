const express = require('express');
const router = express.Router();
const RacaController = require('../controllers/RacaController');
const authMiddleware = require('../middlewares/authMiddleware');

router.get('/racas', RacaController.getAllRacas);

router.post('/racas', authMiddleware, RacaController.createRaca);
router.put('/racas/:id', authMiddleware, RacaController.updateRaca);
router.delete('/racas/:id', authMiddleware, RacaController.deleteRaca);

module.exports = router;
