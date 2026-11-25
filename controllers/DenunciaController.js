const Denuncia = require('../models/Denuncia');

const VALID_STATUSES = ['Pendente', 'Em Análise', 'Em Atendimento', 'Resolvida', 'Arquivada'];

const DenunciaController = {
    getAllDenuncias: async (req, res, next) => {
        try {
            const denuncias = await Denuncia.findAll();
            return res.json(denuncias);
        } catch (error) {
            next(error);
        }
    },

    getDenunciaById: async (req, res, next) => {
        try {
            const { id } = req.params;
            const denuncia = await Denuncia.findById(id);
            if (!denuncia) {
                return res.status(404).json({
                    success: false,
                    message: 'Denúncia não encontrada.'
                });
            }
            return res.json(denuncia);
        } catch (error) {
            next(error);
        }
    },

    createDenuncia: async (req, res, next) => {
        try {
            const {
                anonima,
                denunciante_nome,
                denunciante_contato,
                tipo_maus_tratos,
                especie_animal,
                endereco,
                bairro_cidade,
                data_ocorrencia,
                descricao
            } = req.body;

            const isAnonima = anonima === true || anonima === 'true' || anonima === '1' || anonima === 1;

            if (!tipo_maus_tratos || tipo_maus_tratos.trim() === '') {
                return res.status(400).json({
                    success: false,
                    message: 'O tipo de maus-tratos é obrigatório.'
                });
            }
            if (!especie_animal || especie_animal.trim() === '') {
                return res.status(400).json({
                    success: false,
                    message: 'A espécie/animal envolvido é obrigatória.'
                });
            }
            if (!endereco || endereco.trim().length < 5) {
                return res.status(400).json({
                    success: false,
                    message: 'O endereço ou local da ocorrência é obrigatório (mínimo 5 caracteres).'
                });
            }
            if (!bairro_cidade || bairro_cidade.trim().length < 2) {
                return res.status(400).json({
                    success: false,
                    message: 'O bairro/cidade é obrigatório.'
                });
            }
            if (!descricao || descricao.trim().length < 10) {
                return res.status(400).json({
                    success: false,
                    message: 'A descrição da denúncia é obrigatória e deve ter no mínimo 10 caracteres.'
                });
            }

            const foto = req.file ? `/uploads/${req.file.filename}` : '';

            const created = await Denuncia.create({
                anonima: isAnonima,
                denunciante_nome: isAnonima ? 'Anônimo' : (denunciante_nome ? denunciante_nome.trim() : null),
                denunciante_contato: isAnonima ? null : (denunciante_contato ? denunciante_contato.trim() : null),
                tipo_maus_tratos: tipo_maus_tratos.trim(),
                especie_animal: especie_animal.trim(),
                endereco: endereco.trim(),
                bairro_cidade: bairro_cidade.trim(),
                data_ocorrencia: data_ocorrencia ? data_ocorrencia.trim() : null,
                descricao: descricao.trim(),
                foto
            });

            return res.status(201).json({
                success: true,
                message: 'Denúncia registrada com sucesso.',
                denuncia: created
            });
        } catch (error) {
            next(error);
        }
    },

    updateDenunciaStatus: async (req, res, next) => {
        try {
            const { id } = req.params;
            const { status, observacoes_admin } = req.body;

            const existing = await Denuncia.findById(id);
            if (!existing) {
                return res.status(404).json({
                    success: false,
                    message: 'Denúncia não encontrada.'
                });
            }

            if (!status || !VALID_STATUSES.includes(status)) {
                return res.status(400).json({
                    success: false,
                    message: `Status inválido. Valores permitidos: ${VALID_STATUSES.join(', ')}.`
                });
            }

            const updated = await Denuncia.updateStatus(
                id,
                status,
                observacoes_admin ? observacoes_admin.trim() : ''
            );

            return res.json({
                success: true,
                message: 'Status da denúncia atualizado com sucesso.',
                denuncia: updated
            });
        } catch (error) {
            next(error);
        }
    },

    deleteDenuncia: async (req, res, next) => {
        try {
            const { id } = req.params;
            const deleted = await Denuncia.delete(id);
            if (!deleted) {
                return res.status(404).json({
                    success: false,
                    message: 'Denúncia não encontrada.'
                });
            }
            return res.json({
                success: true,
                message: 'Denúncia excluída com sucesso.'
            });
        } catch (error) {
            next(error);
        }
    }
};

module.exports = DenunciaController;
