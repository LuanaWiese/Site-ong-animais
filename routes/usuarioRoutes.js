const express = require('express');
const router = express.Router();
const UsuarioController = require('../controllers/UsuarioController');
const authMiddleware = require('../middlewares/authMiddleware');

router.get('/usuarios', authMiddleware, UsuarioController.getAllUsuarios);
router.post('/usuarios', authMiddleware, UsuarioController.createUsuario);
router.put('/usuarios/:id', authMiddleware, UsuarioController.updateUsuario);
router.delete('/usuarios/:id', authMiddleware, UsuarioController.deleteUsuario);

module.exports = router;
