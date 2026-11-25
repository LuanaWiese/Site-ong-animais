const db = require('../config/database');
const bcrypt = require('bcryptjs');

const runSeed = async () => {
    console.log('Executando sementes (seed)...');

    // 1. Seed Usuários
    const adminUser = await db.get("SELECT * FROM usuarios WHERE usuario = ?", ['admin']);
    if (!adminUser) {
        const hashedPassword = await bcrypt.hash('admin123', 10);
        await db.run(
            `INSERT INTO usuarios (nome, usuario, senha, perfil, status) 
             VALUES (?, ?, ?, ?, ?)`,
            ['Administrador', 'admin', hashedPassword, 'Administrador', 'Ativo']
        );
        console.log('Usuário admin inicial criado com sucesso.');
    } else {
        console.log('Usuário admin inicial já existe.');
    }

    // 2. Seed Espécies
    const countEspecies = await db.get("SELECT COUNT(*) as count FROM especies");
    if (countEspecies.count === 0) {
        await db.run("INSERT INTO especies (nome, descricao) VALUES (?, ?)", ['Cachorro', 'Canino doméstico']);
        await db.run("INSERT INTO especies (nome, descricao) VALUES (?, ?)", ['Gato', 'Felino doméstico']);
        console.log('Espécies iniciais semeadas.');
    }

    // 3. Seed Raças
    const countRacas = await db.get("SELECT COUNT(*) as count FROM racas");
    if (countRacas.count === 0) {
        // Obter ids
        const dogSpecie = await db.get("SELECT id FROM especies WHERE nome = ?", ['Cachorro']);
        const catSpecie = await db.get("SELECT id FROM especies WHERE nome = ?", ['Gato']);

        if (dogSpecie && catSpecie) {
            await db.run("INSERT INTO racas (nome, especie_id, descricao) VALUES (?, ?, ?)", ['Vira-lata (SRD)', dogSpecie.id, 'Sem Raça Definida']);
            await db.run("INSERT INTO racas (nome, especie_id, descricao) VALUES (?, ?, ?)", ['Labrador', dogSpecie.id, 'Labrador Retriever']);
            await db.run("INSERT INTO racas (nome, especie_id, descricao) VALUES (?, ?, ?)", ['Poodle', dogSpecie.id, 'Poodle']);
            
            await db.run("INSERT INTO racas (nome, especie_id, descricao) VALUES (?, ?, ?)", ['Vira-lata (SRD)', catSpecie.id, 'Sem Raça Definida']);
            await db.run("INSERT INTO racas (nome, especie_id, descricao) VALUES (?, ?, ?)", ['Persa', catSpecie.id, 'Gato Persa']);
            await db.run("INSERT INTO racas (nome, especie_id, descricao) VALUES (?, ?, ?)", ['Siamês', catSpecie.id, 'Gato Siamês']);
            
            console.log('Raças iniciais semeadas.');
        }
    }

    // 4. Seed Animais (se vazio, para exibição no catálogo inicial)
    const countAnimais = await db.get("SELECT COUNT(*) as count FROM animais");
    if (countAnimais.count === 0) {
        const dogSpecie = await db.get("SELECT id FROM especies WHERE nome = ?", ['Cachorro']);
        const catSpecie = await db.get("SELECT id FROM especies WHERE nome = ?", ['Gato']);
        const dogRaca = await db.get("SELECT id FROM racas WHERE nome = ? AND especie_id = ?", ['Vira-lata (SRD)', dogSpecie?.id]);
        const catRaca = await db.get("SELECT id FROM racas WHERE nome = ? AND especie_id = ?", ['Persa', catSpecie?.id]);

        if (dogSpecie && catSpecie && dogRaca && catRaca) {
            await db.run(
                `INSERT INTO animais (nome, foto, idade, sexo, porte, especie_id, raca_id, descricao, status) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                ['Bolinha', '', 2, 'Macho', 'Pequeno', dogSpecie.id, dogRaca.id, 'Um cachorrinho muito brincalhão e dócil.', 'Disponível']
            );
            await db.run(
                `INSERT INTO animais (nome, foto, idade, sexo, porte, especie_id, raca_id, descricao, status) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                ['Mia', '', 1, 'Fêmea', 'Pequeno', catSpecie.id, catRaca.id, 'Gatinha calma e carinhosa, adora dormir no colo.', 'Disponível']
            );
            console.log('Animais iniciais semeados.');
        }
    }

    console.log('Sementes (seed) concluídas com sucesso.');
};

module.exports = runSeed;
