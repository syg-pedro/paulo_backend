const path = require("path")
const swaggerJsdoc = require("swagger-jsdoc")

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "API — Sistema de Agendamento para Clínicas Médicas",
      version: "1.0.0",
      description:
        "Documentação completa da API REST para gerenciamento de consultas médicas. " +
        "Inclui autenticação JWT, agendamento de consultas, busca de endereço por CEP e previsão do tempo.",
      contact: {
        name: "Suporte",
        email: "suporte@clinica.com",
      },
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Servidor local (desenvolvimento)",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Insira o token JWT obtido no login. Exemplo: `eyJhbGci...`",
        },
      },
      schemas: {
        // ── Auth ──────────────────────────────────────────────────────────────
        CadastroInput: {
          type: "object",
          required: ["nome", "email", "password"],
          properties: {
            nome:     { type: "string", example: "Maria Silva" },
            email:    { type: "string", format: "email", example: "maria@clinica.com" },
            password: { type: "string", minLength: 6, example: "senha123" },
            tipo:     { type: "string", enum: ["paciente", "secretario"], default: "paciente" },
          },
        },
        LoginInput: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email:    { type: "string", format: "email", example: "maria@clinica.com" },
            password: { type: "string", example: "senha123" },
          },
        },
        LoginResponse: {
          type: "object",
          properties: {
            token:   { type: "string", example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." },
            usuario: { $ref: "#/components/schemas/Usuario" },
          },
        },
        Usuario: {
          type: "object",
          properties: {
            id:    { type: "string", example: "664a1b2c3d4e5f6a7b8c9d0e" },
            nome:  { type: "string", example: "Maria Silva" },
            email: { type: "string", example: "maria@clinica.com" },
            tipo:  { type: "string", enum: ["paciente", "secretario"] },
          },
        },
        // ── Consulta ─────────────────────────────────────────────────────────
        ConsultaInput: {
          type: "object",
          required: ["nomePaciente", "data", "horario", "especialidade"],
          properties: {
            nomePaciente:  { type: "string", example: "João da Silva" },
            data:          { type: "string", format: "date", example: "2026-05-20" },
            horario:       { type: "string", pattern: "^\\d{2}:\\d{2}$", example: "14:30" },
            especialidade: { type: "string", example: "Cardiologia" },
            observacoes:   { type: "string", example: "Trazer exames anteriores" },
          },
        },
        Consulta: {
          type: "object",
          properties: {
            _id:           { type: "string", example: "664a1b2c3d4e5f6a7b8c9d0e" },
            pacienteId:    { type: "string", example: "664a1b2c3d4e5f6a7b8c9d0f" },
            nomePaciente:  { type: "string", example: "João da Silva" },
            data:          { type: "string", example: "2026-05-20" },
            horario:       { type: "string", example: "14:30" },
            especialidade: { type: "string", example: "Cardiologia" },
            status:        { type: "string", enum: ["pendente", "confirmado", "cancelado"], example: "pendente" },
            observacoes:   { type: "string", example: "Trazer exames anteriores" },
            createdAt:     { type: "string", format: "date-time" },
            updatedAt:     { type: "string", format: "date-time" },
          },
        },
        StatusInput: {
          type: "object",
          required: ["status"],
          properties: {
            status: { type: "string", enum: ["pendente", "confirmado", "cancelado"], example: "confirmado" },
          },
        },
        // ── Externas ─────────────────────────────────────────────────────────
        Endereco: {
          type: "object",
          properties: {
            cep:              { type: "string", example: "01310-100" },
            logradouro:       { type: "string", example: "Avenida Paulista" },
            bairro:           { type: "string", example: "Bela Vista" },
            cidade:           { type: "string", example: "São Paulo" },
            estado:           { type: "string", example: "SP" },
            enderecoCompleto: { type: "string", example: "Avenida Paulista, Bela Vista, São Paulo - SP" },
          },
        },
        Clima: {
          type: "object",
          properties: {
            temChuva:    { type: "boolean", example: false },
            cidade:      { type: "string", example: "Salvador" },
            data:        { type: "string", example: "2026-05-20" },
            descricao:   { type: "string", example: "céu limpo" },
            temperatura: {
              type: "object",
              properties: {
                min: { type: "string", example: "22.5" },
                max: { type: "string", example: "31.0" },
              },
            },
            avisos: { type: "array", items: { type: "string" }, example: [] },
          },
        },
        // ── Erros ────────────────────────────────────────────────────────────
        Erro: {
          type: "object",
          properties: {
            erro: { type: "string", example: "Mensagem de erro" },
          },
        },
      },
    },
    tags: [
      { name: "Autenticação", description: "Cadastro, login e dados do usuário logado" },
      { name: "Consultas",    description: "Agendamento e gerenciamento de consultas" },
      { name: "CEP",          description: "Busca de endereço pelo CEP via ViaCEP" },
      { name: "Clima",        description: "Previsão de chuva via OpenWeatherMap" },
    ],
  },
  apis: [path.join(__dirname, "../routes/*.js")],
}

module.exports = swaggerJsdoc(options)
