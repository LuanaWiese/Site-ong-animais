const Especie = require('../models/Especie');

const EspecieController = {
    getAllEspecies: async (req, res, next) => {
        try {
            const especies = await Especie.findAll();
            return res.json(especies);
        } catch (error) {
            next(error);
        }
    },

    createEspecie: async (req, res, next) => {
        try {
            const { nome, descricao } = req.body;

            if (!nome || nome.trim() === '') {
                return res.status(400).json({
                    success: false,
                    message: 'O nome da espécie é obrigatório.'
                });
            }

            const existing = await Especie.findByName(nome.trim());
            if (existing) {
                return res.status(400).json({
                    success: false,
                    message: 'Já existe uma espécie cadastrada com este nome.'
                });
            }

            const newEspecie = await Especie.create(nome.trim(), descricao ? descricao.trim() : '');
            return res.status(201).json({
                success: true,
                message: 'Espécie cadastrada com sucesso.',
                especie: newEspecie
            });
        } catch (error) {
            next(error);
        }
    },

    updateEspecie: async (req, res, next) => {
        try {
            const { id } = req.params;
            const { nome, descricao } = req.body;

            const existingEspecie = await Especie.findById(id);
            if (!existingEspecie) {
                return res.status(404).json({
                    success: false,
                    message: 'Espécie não encontrada.'
                });
            }

            if (!nome || nome.trim() === '') {
                return res.status(400).json({
                    success: false,
                    message: 'O nome da espécie é obrigatório.'
                });
            }

            const nameCheck = await Especie.findByName(nome.trim());
            if (nameCheck && nameCheck.id !== parseInt(id)) {
                return res.status(400).json({
                    success: false,
                    message: 'Já existe uma outra espécie cadastrada com este nome.'
                });
            }

            const updated = await Especie.update(id, nome.trim(), descricao ? descricao.trim() : '');
            return res.json({
                success: true,
                message: 'Espécie atualizada com sucesso.',
                especie: updated
            });
        } catch (error) {
            next(error);
        }
    },

    deleteEspecie: async (req, res, next) => {
        try {
            const { id } = req.params;

            const existing = await Especie.findById(id);
            if (!existing) {
                return res.status(404).json({
                    success: false,
                    message: 'Espécie não encontrada.'
                });
            }

            const isLinked = await Especie.hasAnimalsOrBreeds(id);
            if (isLinked) {
                return res.status(400).json({
                    success: false,
                    message: 'Não é possível excluir uma espécie que possui raças ou animais vinculados.'
                });
            }

            await Especie.delete(id);
            return res.json({
                success: true,
                message: 'Espécie excluída com sucesso.'
            });
        } catch (error) {
            next(error);
        }
    }
};

module.exports = EspecieController;
