const express = require("express")
const router = express.Router()

const { buscarCep, verificarClima } = require("../controllers/externalController")
const auth = require("../middlewares/auth")

/**
 * @swagger
 * /api/cep/{cep}:
 *   get:
 *     tags: [CEP]
 *     summary: Buscar endereço pelo CEP
 *     description: Consulta a API ViaCEP e retorna o endereço completo formatado. Rota pública.
 *     parameters:
 *       - in: path
 *         name: cep
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^\d{8}$'
 *           example: "01310100"
 *         description: CEP com 8 dígitos numéricos (sem traço)
 *     responses:
 *       200:
 *         description: Endereço encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 endereco: { $ref: '#/components/schemas/Endereco' }
 *       400:
 *         description: CEP em formato inválido
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Erro' }
 *       404:
 *         description: CEP não encontrado
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Erro' }
 *       503:
 *         description: Serviço ViaCEP indisponível
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Erro' }
 */
router.get("/cep/:cep", buscarCep)

/**
 * @swagger
 * /api/clima:
 *   get:
 *     tags: [Clima]
 *     summary: Verificar previsão de chuva
 *     description: >
 *       Consulta a API OpenWeatherMap e retorna a previsão para o dia informado.
 *       A API key fica no backend — nunca exposta ao frontend. Rota protegida.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: cidade
 *         required: true
 *         schema:
 *           type: string
 *           example: "Salvador"
 *         description: Nome da cidade
 *       - in: query
 *         name: data
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *           example: "2026-05-20"
 *         description: Data da consulta (formato YYYY-MM-DD). Limite de 5 dias a partir de hoje.
 *     responses:
 *       200:
 *         description: Previsão obtida com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Clima'
 *       400:
 *         description: Parâmetros ausentes ou formato de data inválido
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Erro' }
 *       401:
 *         description: Não autenticado
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Erro' }
 *       404:
 *         description: Cidade não encontrada
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Erro' }
 *       503:
 *         description: Serviço de clima indisponível
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Erro' }
 */
router.get("/clima", auth, verificarClima)

module.exports = router
