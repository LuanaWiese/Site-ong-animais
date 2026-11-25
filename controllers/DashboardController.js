const db = require('../config/database');

const DashboardController = {
    getStats: async (req, res, next) => {
        try {
            // 1. Contagens de animais por status
            const totalRow = await db.get("SELECT COUNT(*) as count FROM animais");
            const dispRow = await db.get("SELECT COUNT(*) as count FROM animais WHERE status = 'Disponível'");
            const procRow = await db.get("SELECT COUNT(*) as count FROM animais WHERE status = 'Em Processo'");
            const adotRow = await db.get("SELECT COUNT(*) as count FROM animais WHERE status = 'Adotado'");

            // 2. Agrupamento por espécie
            const porEspecie = await db.query(`
                SELECT e.nome AS especie, COUNT(a.id) AS quantidade 
                FROM especies e 
                LEFT JOIN animais a ON a.especie_id = e.id 
                GROUP BY e.id, e.nome
            `);

            // 3. Agrupamento por status
            const porStatus = await db.query(`
                SELECT status, COUNT(*) AS quantidade 
                FROM animais 
                GROUP BY status
            `);

            // 4. Cadastros mensais (últimos 12 meses)
            const rawCadastros = await db.query(`
                SELECT strftime('%Y-%m', created_at) AS ano_mes, COUNT(*) AS quantidade 
                FROM animais 
                WHERE created_at IS NOT NULL
                GROUP BY ano_mes 
                ORDER BY ano_mes ASC
                LIMIT 12
            `);

            const meses = {
                '01': 'Janeiro', '02': 'Fevereiro', '03': 'Março', '04': 'Abril',
                '05': 'Maio', '06': 'Junho', '07': 'Julho', '08': 'Agosto',
                '09': 'Setembro', '10': 'Outubro', '11': 'Novembro', '12': 'Dezembro'
            };

            const cadastrosMensais = rawCadastros.map(row => {
                if (!row.ano_mes) return { mes: 'Sem data', quantidade: row.quantidade };
                const [ano, mes] = row.ano_mes.split('-');
                const mesNome = meses[mes] || mes;
                return {
                    mes: `${mesNome}/${ano.substring(2)}`,
                    quantidade: row.quantidade
                };
            });

            return res.json({
                totalAnimais: totalRow.count || 0,
                disponiveis: dispRow.count || 0,
                emProcesso: procRow.count || 0,
                adotados: adotRow.count || 0,
                porEspecie: porEspecie,
                porStatus: porStatus,
                cadastrosMensais: cadastrosMensais
            });
        } catch (error) {
            next(error);
        }
    }
};

module.exports = DashboardController;
