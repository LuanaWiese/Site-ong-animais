const db = require('../config/database');

const Especie = {
    findAll: async () => {
        return await db.query('SELECT * FROM especies ORDER BY nome ASC');
    },

    findById: async (id) => {
        return await db.get('SELECT * FROM especies WHERE id = ?', [id]);
    },

    findByName: async (nome) => {
        return await db.get('SELECT * FROM especies WHERE nome = ? COLLATE NOCASE', [nome]);
    },

    create: async (nome, descricao) => {
        const result = await db.run(
            'INSERT INTO especies (nome, descricao) VALUES (?, ?)',
            [nome, descricao]
        );
        return { id: result.id, nome, descricao };
    },

    update: async (id, nome, descricao) => {
        await db.run(
            'UPDATE especies SET nome = ?, descricao = ? WHERE id = ?',
            [nome, descricao, id]
        );
        return { id, nome, descricao };
    },

    delete: async (id) => {
        const result = await db.run('DELETE FROM especies WHERE id = ?', [id]);
        return result.changes > 0;
    },

    hasAnimalsOrBreeds: async (id) => {
        const breedCheck = await db.get('SELECT COUNT(*) as count FROM racas WHERE especie_id = ?', [id]);
        if (breedCheck.count > 0) return true;

        const animalCheck = await db.get('SELECT COUNT(*) as count FROM animais WHERE especie_id = ?', [id]);
        if (animalCheck.count > 0) return true;

        return false;
    }
};

module.exports = Especie;
