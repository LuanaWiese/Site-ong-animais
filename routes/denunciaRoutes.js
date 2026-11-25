const express = require('express');
const router = express.Router();
const DenunciaController = require('../controllers/DenunciaController');
const authMiddleware = require('../middlewares/authMiddleware');
const upload = require('../config/multer');

// Rota pública para envio de denúncias
router.post('/denuncias', upload.single('foto'), DenunciaController.createDenuncia);

// Rotas protegidas para visualização e gestão no painel administrativo
router.get('/denuncias', authMiddleware, DenunciaController.getAllDenuncias);
router.get('/denuncias/:id', authMiddleware, DenunciaController.getDenunciaById);
router.put('/denuncias/:id', authMiddleware, DenunciaController.updateDenunciaStatus);
router.delete('/denuncias/:id', authMiddleware, DenunciaController.deleteDenuncia);

module.exports = router;
