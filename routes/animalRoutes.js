const express = require('express');
const router = express.Router();
const AnimalController = require('../controllers/AnimalController');
const authMiddleware = require('../middlewares/authMiddleware');
const upload = require('../config/multer');

router.get('/animais', AnimalController.getAllAnimals);
router.get('/animais/:id', AnimalController.getAnimalById);

router.post('/animais', authMiddleware, upload.single('foto'), AnimalController.createAnimal);
router.put('/animais/:id', authMiddleware, upload.single('foto'), AnimalController.updateAnimal);
router.delete('/animais/:id', authMiddleware, AnimalController.deleteAnimal);

module.exports = router;
