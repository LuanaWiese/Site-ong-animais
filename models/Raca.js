const db = require('../config/database');

const Raca = {
    findAll: async () => {
        return await db.query(`
            SELECT r.*, e.nome AS especie_nome 
            FROM racas r
            JOIN especies e ON r.especie_id = e.id
            ORDER BY r.nome ASC
        `);
    },

    findById: async (id) => {
        return await db.get('SELECT * FROM racas WHERE id = ?', [id]);
    },

    create: async (nome, especie_id, descricao) => {
        const result = await db.run(
            'INSERT INTO racas (nome, especie_id, descricao) VALUES (?, ?, ?)',
            [nome, especie_id, descricao]
        );
        return { id: result.id, nome, especie_id, descricao };
    },

    update: async (id, nome, especie_id, descricao) => {
        await db.run(
            'UPDATE racas SET nome = ?, especie_id = ?, descricao = ? WHERE id = ?',
            [nome, especie_id, descricao, id]
        );
        return { id, nome, especie_id, descricao };
    },

    delete: async (id) => {
        const result = await db.run('DELETE FROM racas WHERE id = ?', [id]);
        return result.changes > 0;
    },

    hasAnimals: async (id) => {
        const check = await db.get('SELECT COUNT(*) as count FROM animais WHERE raca_id = ?', [id]);
        return check.count > 0;
    }
};

module.exports = Raca;
