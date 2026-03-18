# 🏥 Clínica API — Backend

API REST para o **Sistema de Agendamento para Clínicas Médicas**, desenvolvida com Node.js, Express e MongoDB.

---

## 📋 Índice

- [Tecnologias](#tecnologias)
- [Funcionalidades](#funcionalidades)
- [Pré-requisitos](#pré-requisitos)
- [Instalação e uso](#instalação-e-uso)
- [Variáveis de ambiente](#variáveis-de-ambiente)
- [Documentação Swagger](#documentação-swagger)
- [Endpoints](#endpoints)
- [Estrutura do projeto](#estrutura-do-projeto)
- [Autenticação](#autenticação)

---

## Tecnologias

![Node.js](https://img.shields.io/badge/Node.js-20+-339933?style=flat&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-5-000000?style=flat&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat&logo=mongodb&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-Auth-000000?style=flat&logo=jsonwebtokens&logoColor=white)
![Swagger](https://img.shields.io/badge/Swagger-UI-85EA2D?style=flat&logo=swagger&logoColor=black)

| Pacote | Versão | Finalidade |
|--------|--------|------------|
| express | 5.x | Framework HTTP |
| mongoose | 9.x | ODM para MongoDB |
| jsonwebtoken | 9.x | Autenticação JWT |
| bcryptjs | 3.x | Hash de senhas |
| axios | 1.x | Chamadas para APIs externas |
| swagger-ui-express | 5.x | Interface de documentação |
| swagger-jsdoc | 6.x | Geração do spec OpenAPI |
| dotenv | 17.x | Variáveis de ambiente |
| cors | 2.x | Cross-Origin Resource Sharing |
| nodemon | 3.x | Reload automático (dev) |

---

## Funcionalidades

- **Autenticação JWT** — cadastro, login e proteção de rotas por token
- **Controle de acesso por papel** (RBAC) — `paciente` e `secretario`
- **Agendamento de consultas** com verificação de conflito de horário
- **Busca de endereço por CEP** via ViaCEP
- **Previsão de clima** via OpenWeatherMap (API key protegida no backend)
- **Documentação interativa** com Swagger UI
- **Tratamento global de erros** padronizado

---

## Pré-requisitos

- [Node.js](https://nodejs.org/) v18 ou superior
- Conta no [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (plano gratuito disponível)
- Chave da API [OpenWeatherMap](https://openweathermap.org/api) (plano gratuito disponível)

---

## Instalação e uso

### 1. Clone o repositório

```bash
git clone https://github.com/syg-pedro/paulo_backend.git
cd paulo_backend
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure as variáveis de ambiente

Copie o arquivo de exemplo e preencha com seus dados:

```bash
cp .env.example .env
```

Edite o `.env` gerado — veja a seção [Variáveis de ambiente](#variáveis-de-ambiente).

### 4. Inicie o servidor

```bash
# Desenvolvimento (com reload automático)
npm run dev

# Produção
npm start
```

O servidor estará disponível em `http://localhost:3000`.

---

## Variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:

```env
# String de conexão do MongoDB Atlas
MONGO_URI=mongodb+srv://USUARIO:SENHA@cluster.mongodb.net/clinica

# Segredo para assinar os tokens JWT (use uma string longa e aleatória)
JWT_SECRET=troque_por_uma_string_segura_aqui

# Chave da API OpenWeatherMap
OPENWEATHER_API_KEY=sua_chave_aqui

# URL do frontend (usada para configurar o CORS)
FRONTEND_URL=http://localhost:5173

# Porta do servidor (opcional, padrão: 3000)
PORT=3000
```

> ⚠️ Nunca versione o arquivo `.env`. Ele já está listado no `.gitignore`.

---

## Documentação Swagger

A documentação interativa da API é gerada automaticamente com **Swagger UI**.

### Como acessar

1. Inicie o servidor (`npm run dev`)
2. Abra o navegador em:

```
http://localhost:3000/api/docs
```

### Como testar rotas protegidas no Swagger

1. Acesse `http://localhost:3000/api/docs`
2. Use a rota **`POST /api/auth/login`** para obter um token JWT
3. Clique no botão **Authorize 🔒** (canto superior direito)
4. Cole o token no campo **Value** no formato:
   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```
5. Clique em **Authorize** → **Close**
6. Todas as rotas marcadas com 🔒 agora podem ser testadas diretamente

### Especificação OpenAPI (JSON)

O spec completo também está disponível em:

```
http://localhost:3000/api/docs.json
```

---

## Endpoints

### Autenticação — `/api/auth`

| Método | Rota | Auth | Descrição |
|--------|------|:----:|-----------|
| `POST` | `/api/auth/register` | — | Cadastrar novo usuário |
| `POST` | `/api/auth/login` | — | Login — retorna token JWT |
| `GET` | `/api/auth/me` | 🔒 | Dados do usuário autenticado |

**Exemplo — Login:**
```json
POST /api/auth/login
{
  "email": "maria@clinica.com",
  "password": "senha123"
}
```
```json
{
  "token": "eyJhbGci...",
  "usuario": { "id": "...", "nome": "Maria", "tipo": "paciente" }
}
```

---

### Consultas — `/api/consultas`

> Todas as rotas requerem autenticação (`Authorization: Bearer <token>`).

| Método | Rota | Papel | Descrição |
|--------|------|-------|-----------|
| `POST` | `/api/consultas` | Qualquer | Criar consulta |
| `GET` | `/api/consultas` | Qualquer | Listar consultas |
| `GET` | `/api/consultas/:id` | Qualquer | Buscar por ID |
| `PUT` | `/api/consultas/:id/status` | Secretário | Atualizar status |
| `DELETE` | `/api/consultas/:id` | Qualquer* | Remover consulta |

> *Pacientes só podem remover as próprias consultas.

**Filtros disponíveis em `GET /api/consultas`:**
```
?status=pendente|confirmado|cancelado
?data=YYYY-MM-DD
```

---

### APIs Externas — `/api`

| Método | Rota | Auth | Descrição |
|--------|------|:----:|-----------|
| `GET` | `/api/cep/:cep` | — | Buscar endereço pelo CEP |
| `GET` | `/api/clima?cidade=X&data=YYYY-MM-DD` | 🔒 | Previsão de chuva |

---

## Estrutura do projeto

```
paulo_backend/
├── .env.example              # Modelo de variáveis de ambiente
├── .gitignore
├── package.json
├── server.js                 # Ponto de entrada da aplicação
├── config/
│   ├── database.js           # Conexão com MongoDB
│   └── swagger.js            # Configuração do Swagger/OpenAPI
├── controllers/
│   ├── authController.js     # Lógica de registro, login e /me
│   ├── consultaController.js # CRUD de consultas
│   └── externalController.js # CEP e clima
├── middlewares/
│   ├── auth.js               # Verifica JWT e injeta req.usuario
│   ├── isSecretario.js       # RBAC — restringe a secretários
│   └── errorHandler.js       # Tratamento global de erros
├── models/
│   ├── user.js               # Schema do usuário (bcrypt + toJSON)
│   └── consulta.js           # Schema da consulta (status, refs)
├── routes/
│   ├── auth.js               # Rotas de autenticação
│   ├── consultas.js          # Rotas de consultas
│   └── external.js           # Rotas CEP e clima
└── services/
    ├── cepService.js         # Integração ViaCEP
    └── climaService.js       # Integração OpenWeatherMap
```

---

## Autenticação

A API usa **JWT (JSON Web Token)** com expiração de **8 horas**.

Todas as rotas protegidas exigem o header:

```
Authorization: Bearer <seu_token_aqui>
```

### Papéis de usuário

| Papel | Permissões |
|-------|-----------|
| `paciente` | Criar consulta, ver/cancelar as próprias consultas |
| `secretario` | Tudo do paciente + ver todas as consultas + atualizar status |

Para criar um secretário, envie `"tipo": "secretario"` no corpo do cadastro.

---

## Deploy

Para fazer o deploy em produção (Railway, Render, etc.), configure as mesmas variáveis de ambiente do `.env.example` no painel da plataforma escolhida.

> Nunca suba o arquivo `.env` real para o repositório.
