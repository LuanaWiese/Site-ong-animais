const db = require('../config/database');

const Animal = {
    findAll: async () => {
        return await db.query(`
            SELECT a.*, e.nome AS especie_nome, r.nome AS raca_nome 
            FROM animais a
            JOIN especies e ON a.especie_id = e.id
            JOIN racas r ON a.raca_id = r.id
            ORDER BY a.created_at DESC
        `);
    },

    findById: async (id) => {
        return await db.get(`
            SELECT a.*, e.nome AS especie_nome, r.nome AS raca_nome 
            FROM animais a
            JOIN especies e ON a.especie_id = e.id
            JOIN racas r ON a.raca_id = r.id
            WHERE a.id = ?
        `, [id]);
    },

    create: async (nome, foto, idade, sexo, porte, especie_id, raca_id, descricao, status) => {
        const result = await db.run(
            `INSERT INTO animais (nome, foto, idade, sexo, porte, especie_id, raca_id, descricao, status) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [nome, foto, idade, sexo, porte, especie_id, raca_id, descricao, status]
        );
        return { id: result.id, nome, foto, idade, sexo, porte, especie_id, raca_id, descricao, status };
    },

    update: async (id, nome, foto, idade, sexo, porte, especie_id, raca_id, descricao, status) => {
        if (foto !== undefined) {
            await db.run(
                `UPDATE animais 
                 SET nome = ?, foto = ?, idade = ?, sexo = ?, porte = ?, especie_id = ?, raca_id = ?, descricao = ?, status = ?
                 WHERE id = ?`,
                [nome, foto, idade, sexo, porte, especie_id, raca_id, descricao, status, id]
            );
        } else {
            await db.run(
                `UPDATE animais 
                 SET nome = ?, idade = ?, sexo = ?, porte = ?, especie_id = ?, raca_id = ?, descricao = ?, status = ?
                 WHERE id = ?`,
                [nome, idade, sexo, porte, especie_id, raca_id, descricao, status, id]
            );
        }
        return { id, nome, foto, idade, sexo, porte, especie_id, raca_id, descricao, status };
    },

    delete: async (id) => {
        const result = await db.run('DELETE FROM animais WHERE id = ?', [id]);
        return result.changes > 0;
    }
};

module.exports = Animal;
