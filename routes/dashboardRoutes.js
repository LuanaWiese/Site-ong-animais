const express = require('express');
const router = express.Router();
const DashboardController = require('../controllers/DashboardController');

router.get('/dashboard', DashboardController.getStats);

module.exports = router;
