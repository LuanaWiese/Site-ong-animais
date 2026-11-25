const Animal = require('../models/Animal');

const AnimalController = {
    getAllAnimals: async (req, res, next) => {
        try {
            const animals = await Animal.findAll();
            return res.json(animals);
        } catch (error) {
            next(error);
        }
    },

    getAnimalById: async (req, res, next) => {
        try {
            const { id } = req.params;
            const animal = await Animal.findById(id);
            if (!animal) {
                return res.status(404).json({
                    success: false,
                    message: 'Animal não encontrado.'
                });
            }
            return res.json(animal);
        } catch (error) {
            next(error);
        }
    },

    createAnimal: async (req, res, next) => {
        try {
            const { nome, idade, sexo, porte, especie_id, raca_id, descricao, status } = req.body;
            
            // Validações
            if (!nome || nome.trim().length < 3) {
                return res.status(400).json({
                    success: false,
                    message: 'O nome é obrigatório e deve ter no mínimo 3 caracteres.'
                });
            }
            if (!especie_id) {
                return res.status(400).json({ success: false, message: 'A espécie é obrigatória.' });
            }
            if (!raca_id) {
                return res.status(400).json({ success: false, message: 'A raça é obrigatória.' });
            }
            if (!sexo || !['Macho', 'Fêmea'].includes(sexo)) {
                return res.status(400).json({ success: false, message: 'O sexo deve ser "Macho" ou "Fêmea".' });
            }
            if (!porte || !['Pequeno', 'Médio', 'Grande'].includes(porte)) {
                return res.status(400).json({ success: false, message: 'O porte deve ser "Pequeno", "Médio" ou "Grande".' });
            }
            if (!status || !['Disponível', 'Em Processo', 'Adotado'].includes(status)) {
                return res.status(400).json({ success: false, message: 'O status deve ser "Disponível", "Em Processo" ou "Adotado".' });
            }

            const foto = req.file ? `/uploads/${req.file.filename}` : '';

            const newAnimal = await Animal.create(
                nome.trim(),
                foto,
                parseInt(idade) || 0,
                sexo,
                porte,
                parseInt(especie_id),
                parseInt(raca_id),
                descricao ? descricao.trim() : '',
                status
            );

            return res.status(201).json({
                success: true,
                message: 'Animal cadastrado com sucesso.',
                animal: newAnimal
            });
        } catch (error) {
            next(error);
        }
    },

    updateAnimal: async (req, res, next) => {
        try {
            const { id } = req.params;
            const { nome, idade, sexo, porte, especie_id, raca_id, descricao, status } = req.body;

            const existingAnimal = await Animal.findById(id);
            if (!existingAnimal) {
                return res.status(404).json({
                    success: false,
                    message: 'Animal não encontrado.'
                });
            }

            // Validações
            if (!nome || nome.trim().length < 3) {
                return res.status(400).json({
                    success: false,
                    message: 'O nome é obrigatório e deve ter no mínimo 3 caracteres.'
                });
            }
            if (!especie_id) {
                return res.status(400).json({ success: false, message: 'A espécie é obrigatória.' });
            }
            if (!raca_id) {
                return res.status(400).json({ success: false, message: 'A raça é obrigatória.' });
            }
            if (!sexo || !['Macho', 'Fêmea'].includes(sexo)) {
                return res.status(400).json({ success: false, message: 'O sexo deve ser "Macho" ou "Fêmea".' });
            }
            if (!porte || !['Pequeno', 'Médio', 'Grande'].includes(porte)) {
                return res.status(400).json({ success: false, message: 'O porte deve ser "Pequeno", "Médio" ou "Grande".' });
            }
            if (!status || !['Disponível', 'Em Processo', 'Adotado'].includes(status)) {
                return res.status(400).json({ success: false, message: 'O status deve ser "Disponível", "Em Processo" ou "Adotado".' });
            }

            // Se subir nova imagem, atualiza o campo foto
            const foto = req.file ? `/uploads/${req.file.filename}` : undefined;

            const updatedAnimal = await Animal.update(
                id,
                nome.trim(),
                foto,
                parseInt(idade) || 0,
                sexo,
                porte,
                parseInt(especie_id),
                parseInt(raca_id),
                descricao ? descricao.trim() : '',
                status
            );

            return res.json({
                success: true,
                message: 'Animal atualizado com sucesso.',
                animal: updatedAnimal
            });
        } catch (error) {
            next(error);
        }
    },

    deleteAnimal: async (req, res, next) => {
        try {
            const { id } = req.params;
            const sucesso = await Animal.delete(id);
            if (!sucesso) {
                return res.status(404).json({
                    success: false,
                    message: 'Animal não encontrado.'
                });
            }
            return res.json({
                success: true,
                message: 'Animal excluído com sucesso.'
            });
        } catch (error) {
            next(error);
        }
    }
};

module.exports = AnimalController;
