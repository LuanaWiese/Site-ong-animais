const db = require('../config/database');

const Denuncia = {
    findAll: async () => {
        return await db.query(`
            SELECT * FROM denuncias
            ORDER BY created_at DESC, id DESC
        `);
    },

    findById: async (id) => {
        return await db.get(`SELECT * FROM denuncias WHERE id = ?`, [id]);
    },

    create: async ({
        anonima,
        denunciante_nome,
        denunciante_contato,
        tipo_maus_tratos,
        especie_animal,
        endereco,
        bairro_cidade,
        data_ocorrencia,
        descricao,
        foto
    }) => {
        const result = await db.run(
            `INSERT INTO denuncias (
                anonima, denunciante_nome, denunciante_contato,
                tipo_maus_tratos, especie_animal, endereco,
                bairro_cidade, data_ocorrencia, descricao, foto, status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pendente')`,
            [
                anonima ? 1 : 0,
                denunciante_nome || null,
                denunciante_contato || null,
                tipo_maus_tratos,
                especie_animal,
                endereco,
                bairro_cidade,
                data_ocorrencia || null,
                descricao,
                foto || ''
            ]
        );
        return await Denuncia.findById(result.id);
    },

    updateStatus: async (id, status, observacoes_admin) => {
        await db.run(
            `UPDATE denuncias SET status = ?, observacoes_admin = ? WHERE id = ?`,
            [status, observacoes_admin || null, id]
        );
        return await Denuncia.findById(id);
    },

    delete: async (id) => {
        const result = await db.run('DELETE FROM denuncias WHERE id = ?', [id]);
        return result.changes > 0;
    }
};

module.exports = Denuncia;
