const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'animal-care-secret-key-12345';

module.exports = {
    generateToken: (payload) => {
        return jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
    },
    verifyToken: (token) => {
        return jwt.verify(token, JWT_SECRET);
    }
};
