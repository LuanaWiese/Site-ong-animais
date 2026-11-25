\# PRD - Sistema Web para ONG de Proteção Animal

\## 1. Visão Geral

\### Nome do Projeto

ONG Animal Care

\### Objetivo

Desenvolver uma plataforma web para uma ONG de proteção animal, permitindo:

* Divulgação institucional da ONG;
* Exibição de animais disponíveis para adoção;
* Gerenciamento administrativo dos dados do sistema;
* Controle de acesso administrativo;
* Cadastro e gerenciamento completo (CRUD) das entidades do sistema;
* Exibição de indicadores e gráficos administrativos.

\---

\# 2. Objetivos do Negócio

* Facilitar a adoção responsável de animais.
* Centralizar informações da ONG.
* Permitir gestão simples dos animais e processos internos.
* Disponibilizar uma área administrativa para gerenciamento dos dados.
* Melhorar a visibilidade da ONG através de um site moderno e responsivo.

\---

\# 3. Tecnologias Obrigatórias

\## Arquitetura

MVC (Model View Controller)

\### Estrutura

/backend

/controllers

/models

/routes

/middlewares

/database

/frontend

/pages

/components

/assets

/js

/css

\---

\## Backend

* NodeJS
* JavaScript
* ExpressJS
* SQLite
* JWT Authentication
* bcrypt

\---

\## Frontend

* HTML5
* CSS3
* JavaScript
* Tailwind CSS
* Axios
* Phosphor Icons
* Chart.js

\---

\# 4. Perfis de Usuário

\## Visitante

Pode:

* Visualizar site institucional
* Consultar animais disponíveis
* Filtrar animais
* Visualizar detalhes dos animais
* Entrar em contato com a ONG

Não pode:

* Acessar painel administrativo

\---

\## Administrador

Usuário inicial:

\```json

{

"usuario": "admin",

"senha": "admin123"

}

\```

Pode:

* Acessar dashboard
* Gerenciar todos os cadastros
* Gerenciar animais
* Visualizar estatísticas

\---

\# 5. Estrutura do Site Público

O site deve possuir no mínimo 4 seções.

\## 5.1 Home

Apresentação da ONG.

Conteúdo:

* Banner principal
* Chamada para adoção
* Estatísticas rápidas
* Botão "Conheça nossos animais"

\---

\## 5.2 Sobre Nós

Conteúdo:

* História da ONG
* Missão
* Visão
* Valores
* Equipe

\---

\## 5.3 Animais para Adoção

Catálogo completo.

Funcionalidades:

* Listagem de animais
* Busca
* Filtros
* Paginação
* Cards responsivos

Informações:

* Foto
* Nome
* Idade
* Sexo
* Porte
* Status

\---

\## 5.4 Contato

Conteúdo:

* Formulário de contato
* Endereço
* Telefone
* E-mail
* Redes sociais

\---

\# 6. Catálogo de Animais

Cada animal deverá possuir:

| Campo        | Tipo    |

\| ------------ | ------- |

| id           | Integer |

| nome         | String  |

| foto         | String  |

| idade        | Integer |

| sexo         | Enum    |

| porte        | Enum    |

| espécie      | Enum    |

| raça         | String  |

| descrição    | Text    |

| status       | Enum    |

| dataCadastro | Date    |

\---

\## Status

* Disponível
* Em processo de adoção
* Adotado

\---

\## Espécies

Inicialmente:

* Cachorro
* Gato

Mas devem ser cadastráveis.

\---

\# 7. Painel Administrativo

\## Dashboard

Exibir indicadores:

\### Cards

* Total de Animais
* Disponíveis
* Em Processo
* Adotados

\### Gráficos

\#### Gráfico 1

Animais por espécie

Tipo:

* Doughnut

\#### Gráfico 2

Animais por status

Tipo:

* Bar

\#### Gráfico 3

Cadastros mensais

Tipo:

* Line

\---

\# 8. Cadastros (CRUD Completo)

O sistema deve possuir no mínimo 4 módulos de cadastro.

\---

\## 8.1 Cadastro de Animais

CRUD completo

Campos:

* Nome
* Foto
* Idade
* Sexo
* Porte
* Espécie
* Raça
* Descrição
* Status

\---

\## 8.2 Cadastro de Espécies

CRUD completo

Exemplos:

* Cachorro
* Gato
* Coelho
* Pássaro

Campos:

* Nome
* Descrição

\---

\## 8.3 Cadastro de Raças

CRUD completo

Campos:

* Nome
* Espécie
* Descrição

\---

\## 8.4 Cadastro de Usuários

CRUD completo

Campos:

* Nome
* Usuário
* Senha
* Perfil
* Status

Perfis:

* Administrador

\---

\# 9. Requisitos Funcionais

\## RF001

Realizar login administrativo.

\---

\## RF002

Realizar logout.

\---

\## RF003

Cadastrar animais.

\---

\## RF004

Editar animais.

\---

\## RF005

Excluir animais.

\---

\## RF006

Listar animais.

\---

\## RF007

Cadastrar espécies.

\---

\## RF008

Cadastrar raças.

\---

\## RF009

Cadastrar usuários.

\---

\## RF010

Exibir dashboard com indicadores.

\---

\## RF011

Exibir gráficos estatísticos.

\---

\## RF012

Filtrar animais para adoção.

\---

\## RF013

Pesquisar animais.

\---

\## RF014

Visualizar detalhes do animal.

\---

\# 10. Requisitos Não Funcionais

\## RNF001

Sistema responsivo.

\---

\## RNF002

Compatível com:

* Chrome
* Edge
* Firefox

\---

\## RNF003

Layout moderno utilizando Tailwind CSS.

\---

\## RNF004

Tempo de resposta inferior a 2 segundos.

\---

\## RNF005

Arquitetura MVC obrigatória.

\---

\## RNF006

Código modularizado.

\---

\## RNF007

Utilizar API REST.

\---

\# 11. Segurança

\## Autenticação

JWT

\---

\## Senhas

Armazenadas utilizando:

bcrypt

\---

\## Rotas Protegidas

* Dashboard
* Animais
* Espécies
* Raças
* Usuários

\---

\## Middleware

authMiddleware

Responsável por:

* Validar JWT
* Proteger rotas privadas

\---

\# 12. Banco de Dados

\## Tabela usuarios

\```sql

id INTEGER PRIMARY KEY

nome TEXT

usuario TEXT UNIQUE

senha TEXT

perfil TEXT

status TEXT

created\_at DATETIME

\```

\---

\## Tabela especies

\```sql

id INTEGER PRIMARY KEY

nome TEXT

descricao TEXT

created\_at DATETIME

\```

\---

\## Tabela racas

\```sql

id INTEGER PRIMARY KEY

nome TEXT

especie\_id INTEGER

descricao TEXT

created\_at DATETIME

\```

\---

\## Tabela animais

\```sql

id INTEGER PRIMARY KEY

nome TEXT

foto TEXT

idade INTEGER

sexo TEXT

porte TEXT

especie\_id INTEGER

raca\_id INTEGER

descricao TEXT

status TEXT

created\_at DATETIME

\```

\---

\# 13. APIs REST

\## Auth

POST /api/auth/login

POST /api/auth/logout

\---

\## Animais

GET /api/animais

GET /api/animais/:id

POST /api/animais

PUT /api/animais/:id

DELETE /api/animais/:id

\---

\## Espécies

GET /api/especies

POST /api/especies

PUT /api/especies/:id

DELETE /api/especies/:id

\---

\## Raças

GET /api/racas

POST /api/racas

PUT /api/racas/:id

DELETE /api/racas/:id

\---

\## Usuários

GET /api/usuarios

POST /api/usuarios

PUT /api/usuarios/:id

DELETE /api/usuarios/:id

\---

\# 14. Layout Administrativo

\## Sidebar

Menus:

* Dashboard
* Animais
* Espécies
* Raças
* Usuários
* Sair

\---

\## Topbar

* Nome do usuário logado
* Foto/avatar
* Logout

\---

\## Conteúdo

* Tabelas
* Formulários
* Gráficos
* Indicadores

\---

\# 15. Seed Inicial

Ao iniciar o sistema pela primeira vez:

Criar automaticamente:

Usuário:

\```json

{

"nome": "Administrador",

"usuario": "admin",

"senha": "admin123",

"perfil": "Administrador",

"status": "Ativo"

}

\```

Senha deve ser armazenada criptografada com bcrypt.

\---

\# 16. Critérios de Aceitação

* Sistema inicia sem erros.
* Usuário admin consegue acessar o painel.
* Todos os CRUDs funcionam.
* Dashboard exibe dados reais.
* Gráficos são atualizados automaticamente.
* Site é totalmente responsivo.
* API REST documentada.
* Banco SQLite criado automaticamente.
* Seed inicial executada automaticamente.
* Catálogo de adoção acessível ao público.
* Rotas privadas protegidas por JWT.
* Código organizado em MVC.
