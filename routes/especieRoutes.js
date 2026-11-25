const express = require('express');
const router = express.Router();
const EspecieController = require('../controllers/EspecieController');
const authMiddleware = require('../middlewares/authMiddleware');

router.get('/especies', EspecieController.getAllEspecies);

router.post('/especies', authMiddleware, EspecieController.createEspecie);
router.put('/especies/:id', authMiddleware, EspecieController.updateEspecie);
router.delete('/especies/:id', authMiddleware, EspecieController.deleteEspecie);

module.exports = router;
