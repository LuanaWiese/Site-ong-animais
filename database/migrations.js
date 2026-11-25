const db = require('../config/database');

const runMigrations = async () => {
    console.log('Executando migrações...');
    
    // Tabela usuarios
    await db.run(`
        CREATE TABLE IF NOT EXISTS usuarios (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT NOT NULL,
            usuario TEXT UNIQUE NOT NULL,
            senha TEXT NOT NULL,
            perfil TEXT NOT NULL,
            status TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Tabela especies
    await db.run(`
        CREATE TABLE IF NOT EXISTS especies (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT UNIQUE NOT NULL,
            descricao TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Tabela racas
    await db.run(`
        CREATE TABLE IF NOT EXISTS racas (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT NOT NULL,
            especie_id INTEGER NOT NULL,
            descricao TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (especie_id) REFERENCES especies(id)
        )
    `);

    // Tabela animais
    await db.run(`
        CREATE TABLE IF NOT EXISTS animais (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT NOT NULL,
            foto TEXT,
            idade INTEGER NOT NULL,
            sexo TEXT CHECK(sexo IN ('Macho', 'Fêmea')) NOT NULL,
            porte TEXT CHECK(porte IN ('Pequeno', 'Médio', 'Grande')) NOT NULL,
            especie_id INTEGER NOT NULL,
            raca_id INTEGER NOT NULL,
            descricao TEXT,
            status TEXT CHECK(status IN ('Disponível', 'Em Processo', 'Adotado')) NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (especie_id) REFERENCES especies(id),
            FOREIGN KEY (raca_id) REFERENCES racas(id)
        )
    `);

    // Tabela denuncias
    await db.run(`
        CREATE TABLE IF NOT EXISTS denuncias (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            anonima INTEGER DEFAULT 0,
            denunciante_nome TEXT,
            denunciante_contato TEXT,
            tipo_maus_tratos TEXT NOT NULL,
            especie_animal TEXT NOT NULL,
            endereco TEXT NOT NULL,
            bairro_cidade TEXT NOT NULL,
            data_ocorrencia TEXT,
            descricao TEXT NOT NULL,
            foto TEXT,
            status TEXT CHECK(status IN ('Pendente', 'Em Análise', 'Em Atendimento', 'Resolvida', 'Arquivada')) NOT NULL DEFAULT 'Pendente',
            observacoes_admin TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    console.log('Migrações concluídas com sucesso.');
};

module.exports = runMigrations;
