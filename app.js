const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const runMigrations = require('./database/migrations');
const runSeed = require('./database/seed');

// Import Routes
const authRoutes = require('./routes/authRoutes');
const animalRoutes = require('./routes/animalRoutes');
const especieRoutes = require('./routes/especieRoutes');
const racaRoutes = require('./routes/racaRoutes');
const usuarioRoutes = require('./routes/usuarioRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const denunciaRoutes = require('./routes/denunciaRoutes');

// Import Error Middleware
const errorMiddleware = require('./middlewares/errorMiddleware');

const app = express();

// Enable CORS and JSON body parser
app.use(cors());
app.use(express.json());

// Ensure uploads folder exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Serve static images uploads
app.use('/uploads', express.static(uploadsDir));

// Initialize Database (Migrations + Seeds)
(async () => {
    try {
        await runMigrations();
        await runSeed();
    } catch (err) {
        console.error('Falha crítica ao inicializar banco de dados SQLite:', err);
    }
})();

// API Routes mounting
app.use('/api/auth', authRoutes);
app.use('/api', animalRoutes);
app.use('/api', especieRoutes);
app.use('/api', racaRoutes);
app.use('/api', usuarioRoutes);
app.use('/api', dashboardRoutes);
app.use('/api', denunciaRoutes);

// Error Handling Middleware
app.use(errorMiddleware);

module.exports = app;
