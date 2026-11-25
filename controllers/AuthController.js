const Usuario = require('../models/Usuario');
const { comparePassword } = require('../utils/bcrypt');
const { generateToken } = require('../utils/jwt');

const AuthController = {
    login: async (req, res, next) => {
        try {
            const { usuario, senha } = req.body;
            
            if (!usuario || !senha) {
                return res.status(400).json({
                    success: false,
                    message: 'Usuário e senha são obrigatórios.'
                });
            }

            const user = await Usuario.findByUsuario(usuario);
            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: 'Usuário ou senha incorretos.'
                });
            }

            if (user.status !== 'Ativo') {
                return res.status(401).json({
                    success: false,
                    message: 'Esta conta de usuário está inativa.'
                });
            }

            const passwordMatch = await comparePassword(senha, user.senha);
            if (!passwordMatch) {
                return res.status(401).json({
                    success: false,
                    message: 'Usuário ou senha incorretos.'
                });
            }

            const token = generateToken({
                id: user.id,
                nome: user.nome,
                usuario: user.usuario,
                perfil: user.perfil
            });

            return res.json({
                success: true,
                token: token,
                usuario: {
                    id: user.id,
                    nome: user.nome
                }
            });
        } catch (error) {
            next(error);
        }
    },

    logout: async (req, res) => {
        return res.json({
            success: true,
            message: 'Logout realizado com sucesso.'
        });
    }
};

module.exports = AuthController;
