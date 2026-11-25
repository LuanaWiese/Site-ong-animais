const Raca = require('../models/Raca');
const Especie = require('../models/Especie');

const RacaController = {
    getAllRacas: async (req, res, next) => {
        try {
            const racas = await Raca.findAll();
            return res.json(racas);
        } catch (error) {
            next(error);
        }
    },

    createRaca: async (req, res, next) => {
        try {
            const { nome, especie_id, descricao } = req.body;

            if (!nome || nome.trim() === '') {
                return res.status(400).json({
                    success: false,
                    message: 'O nome da raça é obrigatório.'
                });
            }
            if (!especie_id) {
                return res.status(400).json({
                    success: false,
                    message: 'A espécie é obrigatória.'
                });
            }

            // Verificar se espécie existe
            const specie = await Especie.findById(especie_id);
            if (!specie) {
                return res.status(400).json({
                    success: false,
                    message: 'Espécie não encontrada.'
                });
            }

            const newRaca = await Raca.create(nome.trim(), parseInt(especie_id), descricao ? descricao.trim() : '');
            return res.status(201).json({
                success: true,
                message: 'Raça cadastrada com sucesso.',
                raca: newRaca
            });
        } catch (error) {
            next(error);
        }
    },

    updateRaca: async (req, res, next) => {
        try {
            const { id } = req.params;
            const { nome, especie_id, descricao } = req.body;

            const existingRaca = await Raca.findById(id);
            if (!existingRaca) {
                return res.status(404).json({
                    success: false,
                    message: 'Raça não encontrada.'
                });
            }

            if (!nome || nome.trim() === '') {
                return res.status(400).json({
                    success: false,
                    message: 'O nome da raça é obrigatório.'
                });
            }
            if (!especie_id) {
                return res.status(400).json({
                    success: false,
                    message: 'A espécie é obrigatória.'
                });
            }

            const specie = await Especie.findById(especie_id);
            if (!specie) {
                return res.status(400).json({
                    success: false,
                    message: 'Espécie não encontrada.'
                });
            }

            const updated = await Raca.update(id, nome.trim(), parseInt(especie_id), descricao ? descricao.trim() : '');
            return res.json({
                success: true,
                message: 'Raça atualizada com sucesso.',
                raca: updated
            });
        } catch (error) {
            next(error);
        }
    },

    deleteRaca: async (req, res, next) => {
        try {
            const { id } = req.params;

            const existing = await Raca.findById(id);
            if (!existing) {
                return res.status(404).json({
                    success: false,
                    message: 'Raça não encontrada.'
                });
            }

            const isLinked = await Raca.hasAnimals(id);
            if (isLinked) {
                return res.status(400).json({
                    success: false,
                    message: 'Não é possível excluir uma raça que possui animais vinculados.'
                });
            }

            await Raca.delete(id);
            return res.json({
                success: true,
                message: 'Raça excluída com sucesso.'
            });
        } catch (error) {
            next(error);
        }
    }
};

module.exports = RacaController;
