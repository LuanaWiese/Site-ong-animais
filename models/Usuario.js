const db = require('../config/database');

const Usuario = {
    findAll: async () => {
        return await db.query('SELECT id, nome, usuario, perfil, status, created_at FROM usuarios');
    },

    findById: async (id) => {
        return await db.get('SELECT id, nome, usuario, perfil, status, created_at FROM usuarios WHERE id = ?', [id]);
    },

    findByUsuario: async (usuario) => {
        return await db.get('SELECT * FROM usuarios WHERE usuario = ?', [usuario]);
    },

    create: async (nome, usuario, senha, perfil, status) => {
        const result = await db.run(
            'INSERT INTO usuarios (nome, usuario, senha, perfil, status) VALUES (?, ?, ?, ?, ?)',
            [nome, usuario, senha, perfil, status]
        );
        return { id: result.id, nome, usuario, perfil, status };
    },

    update: async (id, nome, usuario, senha, perfil, status) => {
        if (senha) {
            await db.run(
                'UPDATE usuarios SET nome = ?, usuario = ?, senha = ?, perfil = ?, status = ? WHERE id = ?',
                [nome, usuario, senha, perfil, status, id]
            );
        } else {
            await db.run(
                'UPDATE usuarios SET nome = ?, usuario = ?, perfil = ?, status = ? WHERE id = ?',
                [nome, usuario, perfil, status, id]
            );
        }
        return { id, nome, usuario, perfil, status };
    },

    delete: async (id) => {
        const result = await db.run('DELETE FROM usuarios WHERE id = ?', [id]);
        return result.changes > 0;
    }
};

module.exports = Usuario;
