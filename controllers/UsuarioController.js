const Usuario = require('../models/Usuario');
const { hashPassword } = require('../utils/bcrypt');

const UsuarioController = {
    getAllUsuarios: async (req, res, next) => {
        try {
            const users = await Usuario.findAll();
            return res.json(users);
        } catch (error) {
            next(error);
        }
    },

    createUsuario: async (req, res, next) => {
        try {
            const { nome, usuario, senha, perfil, status } = req.body;

            // Validações
            if (!nome || nome.trim() === '') {
                return res.status(400).json({ success: false, message: 'O nome é obrigatório.' });
            }
            if (!usuario || usuario.trim() === '') {
                return res.status(400).json({ success: false, message: 'O usuário de login é obrigatório.' });
            }
            if (!senha || senha.length < 8) {
                return res.status(400).json({ success: false, message: 'A senha é obrigatória e deve ter no mínimo 8 caracteres.' });
            }
            if (!perfil || perfil !== 'Administrador') {
                return res.status(400).json({ success: false, message: 'O perfil deve ser "Administrador".' });
            }
            if (!status || !['Ativo', 'Inativo'].includes(status)) {
                return res.status(400).json({ success: false, message: 'O status deve ser "Ativo" ou "Inativo".' });
            }

            const existing = await Usuario.findByUsuario(usuario.trim());
            if (existing) {
                return res.status(400).json({
                    success: false,
                    message: 'Este usuário de login já está cadastrado.'
                });
            }

            const hashed = await hashPassword(senha);
            const newUser = await Usuario.create(
                nome.trim(),
                usuario.trim(),
                hashed,
                perfil,
                status
            );

            return res.status(201).json({
                success: true,
                message: 'Usuário cadastrado com sucesso.',
                usuario: {
                    id: newUser.id,
                    nome: newUser.nome,
                    usuario: newUser.usuario,
                    perfil: newUser.perfil,
                    status: newUser.status
                }
            });
        } catch (error) {
            next(error);
        }
    },

    updateUsuario: async (req, res, next) => {
        try {
            const { id } = req.params;
            const { nome, usuario, senha, perfil, status } = req.body;

            const existingUser = await Usuario.findById(id);
            if (!existingUser) {
                return res.status(404).json({
                    success: false,
                    message: 'Usuário não encontrado.'
                });
            }

            // Validações
            if (!nome || nome.trim() === '') {
                return res.status(400).json({ success: false, message: 'O nome é obrigatório.' });
            }
            if (!usuario || usuario.trim() === '') {
                return res.status(400).json({ success: false, message: 'O usuário de login é obrigatório.' });
            }
            if (senha && senha.length < 8) {
                return res.status(400).json({ success: false, message: 'A senha deve ter no mínimo 8 caracteres.' });
            }
            if (!perfil || perfil !== 'Administrador') {
                return res.status(400).json({ success: false, message: 'O perfil deve ser "Administrador".' });
            }
            if (!status || !['Ativo', 'Inativo'].includes(status)) {
                return res.status(400).json({ success: false, message: 'O status deve ser "Ativo" ou "Inativo".' });
            }

            // Se for o admin mestre (ID 1), impedir alteração de usuário, perfil ou inativação
            if (parseInt(id) === 1) {
                if (status === 'Inativo') {
                    return res.status(400).json({
                        success: false,
                        message: 'O usuário administrador inicial não pode ser inativado.'
                    });
                }
                if (usuario.trim() !== 'admin') {
                    return res.status(400).json({
                        success: false,
                        message: 'O login do administrador inicial não pode ser alterado.'
                    });
                }
            }

            const userCheck = await Usuario.findByUsuario(usuario.trim());
            if (userCheck && userCheck.id !== parseInt(id)) {
                return res.status(400).json({
                    success: false,
                    message: 'Este usuário de login já está em uso por outra conta.'
                });
            }

            let hashed = undefined;
            if (senha) {
                hashed = await hashPassword(senha);
            }

            const updated = await Usuario.update(
                id,
                nome.trim(),
                usuario.trim(),
                hashed,
                perfil,
                status
            );

            return res.json({
                success: true,
                message: 'Usuário atualizado com sucesso.',
                usuario: updated
            });
        } catch (error) {
            next(error);
        }
    },

    deleteUsuario: async (req, res, next) => {
        try {
            const { id } = req.params;

            if (parseInt(id) === 1) {
                return res.status(400).json({
                    success: false,
                    message: 'O usuário administrador inicial não pode ser removido.'
                });
            }

            const existing = await Usuario.findById(id);
            if (!existing) {
                return res.status(404).json({
                    success: false,
                    message: 'Usuário não encontrado.'
                });
            }

            await Usuario.delete(id);
            return res.json({
                success: true,
                message: 'Usuário excluído com sucesso.'
            });
        } catch (error) {
            next(error);
        }
    }
};

module.exports = UsuarioController;
