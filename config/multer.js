const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadsDir = path.resolve(__dirname, '../uploads');

if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({

    destination: (req, file, cb) => {

        cb(null, uploadsDir);

    },

    filename: (req, file, cb) => {

        const uniqueName =
            `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname).toLowerCase()}`;

        cb(null, uniqueName);

    }

});

module.exports = multer({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['.jpg', '.jpeg', '.png', '.webp'];
        const ext = path.extname(file.originalname).toLowerCase();

        if (!allowedTypes.includes(ext)) {
            return cb(new Error('Formato de imagem inválido. Use jpg, jpeg, png ou webp.'));
        }

        cb(null, true);
    }
});
