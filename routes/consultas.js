const express = require("express")
const router = express.Router()

const {
  criar,
  listar,
  buscarPorId,
  atualizarStatus,
  remover,
} = require("../controllers/consultaController")
const auth = require("../middlewares/auth")
const isSecretario = require("../middlewares/isSecretario")

router.use(auth)

/**
 * @swagger
 * /api/consultas:
 *   post:
 *     tags: [Consultas]
 *     summary: Criar consulta
 *     description: Agenda uma nova consulta. Verifica conflito de horário para a mesma especialidade.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ConsultaInput'
 *     responses:
 *       201:
 *         description: Consulta agendada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensagem:  { type: string }
 *                 consulta:  { $ref: '#/components/schemas/Consulta' }
 *       400:
 *         description: Campos obrigatórios ausentes
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Erro' }
 *       401:
 *         description: Não autenticado
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Erro' }
 *       409:
 *         description: Conflito de horário para a especialidade informada
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Erro' }
 */
router.post("/", criar)

/**
 * @swagger
 * /api/consultas:
 *   get:
 *     tags: [Consultas]
 *     summary: Listar consultas
 *     description: >
 *       Retorna consultas filtradas por papel:
 *       pacientes veem apenas as suas; secretários veem todas.
 *       Suporta filtros opcionais por `status` e `data`.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pendente, confirmado, cancelado]
 *         description: Filtrar pelo status da consulta
 *       - in: query
 *         name: data
 *         schema:
 *           type: string
 *           format: date
 *           example: "2026-05-20"
 *         description: Filtrar por data (formato YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Lista de consultas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total:
 *                   type: integer
 *                   example: 3
 *                 consultas:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Consulta'
 *       401:
 *         description: Não autenticado
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Erro' }
 */
router.get("/", listar)

/**
 * @swagger
 * /api/consultas/{id}:
 *   get:
 *     tags: [Consultas]
 *     summary: Buscar consulta por ID
 *     description: Pacientes só podem ver suas próprias consultas. Secretários veem qualquer uma.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da consulta (MongoDB ObjectId)
 *     responses:
 *       200:
 *         description: Consulta encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 consulta: { $ref: '#/components/schemas/Consulta' }
 *       401:
 *         description: Não autenticado
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Erro' }
 *       403:
 *         description: Acesso negado (consulta de outro paciente)
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Erro' }
 *       404:
 *         description: Consulta não encontrada
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Erro' }
 */
router.get("/:id", buscarPorId)

/**
 * @swagger
 * /api/consultas/{id}/status:
 *   put:
 *     tags: [Consultas]
 *     summary: Atualizar status da consulta
 *     description: Exclusivo para secretários. Altera o status para pendente, confirmado ou cancelado.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da consulta
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/StatusInput'
 *     responses:
 *       200:
 *         description: Status atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensagem: { type: string }
 *                 consulta: { $ref: '#/components/schemas/Consulta' }
 *       400:
 *         description: Status inválido
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Erro' }
 *       401:
 *         description: Não autenticado
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Erro' }
 *       403:
 *         description: Acesso negado — apenas secretários
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Erro' }
 *       404:
 *         description: Consulta não encontrada
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Erro' }
 */
router.put("/:id/status", isSecretario, atualizarStatus)

/**
 * @swagger
 * /api/consultas/{id}:
 *   delete:
 *     tags: [Consultas]
 *     summary: Remover consulta
 *     description: Pacientes só podem remover suas próprias consultas. Secretários podem remover qualquer uma.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da consulta
 *     responses:
 *       200:
 *         description: Consulta removida com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensagem: { type: string, example: "Consulta removida com sucesso" }
 *       401:
 *         description: Não autenticado
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Erro' }
 *       403:
 *         description: Acesso negado (consulta de outro paciente)
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Erro' }
 *       404:
 *         description: Consulta não encontrada
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Erro' }
 */
router.delete("/:id", remover)

module.exports = router
