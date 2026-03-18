const express = require("express")
const router = express.Router()

const { register, login, me } = require("../controllers/authController")
const auth = require("../middlewares/auth")

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     tags: [Autenticação]
 *     summary: Cadastrar novo usuário
 *     description: Cria uma conta de paciente ou secretário. A senha é armazenada com hash bcrypt.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CadastroInput'
 *     responses:
 *       201:
 *         description: Usuário criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensagem: { type: string, example: "Usuário cadastrado com sucesso" }
 *                 usuario:  { $ref: '#/components/schemas/Usuario' }
 *       400:
 *         description: Dados inválidos ou e-mail já cadastrado
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Erro' }
 */
router.post("/register", register)

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     tags: [Autenticação]
 *     summary: Fazer login
 *     description: Autentica o usuário e retorna um token JWT válido por 8 horas.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginInput'
 *     responses:
 *       200:
 *         description: Login realizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       401:
 *         description: Credenciais inválidas
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Erro' }
 */
router.post("/login", login)

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     tags: [Autenticação]
 *     summary: Dados do usuário autenticado
 *     description: Retorna as informações do usuário dono do token JWT enviado.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dados do usuário
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 usuario: { $ref: '#/components/schemas/Usuario' }
 *       401:
 *         description: Token não fornecido ou inválido
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Erro' }
 */
router.get("/me", auth, me)

module.exports = router
