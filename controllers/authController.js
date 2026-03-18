const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const User = require("../models/user")

/**
 * POST /api/auth/register
 * Cadastra um novo usuário (paciente ou secretário).
 */
const register = async (req, res, next) => {
  try {
    const { nome, email, password, tipo } = req.body

    if (!nome || !email || !password) {
      return res.status(400).json({ erro: "Preencha todos os campos obrigatórios" })
    }

    if (password.length < 6) {
      return res.status(400).json({ erro: "A senha deve ter ao menos 6 caracteres" })
    }

    const emailExistente = await User.findOne({ email: email.toLowerCase() })
    if (emailExistente) {
      return res.status(400).json({ erro: "Email já cadastrado" })
    }

    const senhaHash = await bcrypt.hash(password, 12)

    const usuario = await User.create({
      nome,
      email,
      senha: senhaHash,
      tipo: tipo || "paciente",
    })

    res.status(201).json({
      mensagem: "Usuário cadastrado com sucesso",
      usuario,
    })
  } catch (err) {
    next(err)
  }
}

/**
 * POST /api/auth/login
 * Autentica o usuário e retorna um token JWT.
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ erro: "Email e senha são obrigatórios" })
    }

    const usuario = await User.findOne({ email: email.toLowerCase() }).select("+senha")

    if (!usuario) {
      // Mensagem genérica para não revelar se o email existe
      return res.status(401).json({ erro: "Credenciais inválidas" })
    }

    const senhaValida = await bcrypt.compare(password, usuario.senha)
    if (!senhaValida) {
      return res.status(401).json({ erro: "Credenciais inválidas" })
    }

    const token = jwt.sign(
      { id: usuario._id, tipo: usuario.tipo },
      process.env.JWT_SECRET,
      { expiresIn: "8h" }
    )

    res.json({
      token,
      usuario: {
        id: usuario._id,
        nome: usuario.nome,
        email: usuario.email,
        tipo: usuario.tipo,
      },
    })
  } catch (err) {
    next(err)
  }
}

/**
 * GET /api/auth/me
 * Retorna os dados do usuário autenticado.
 */
const me = async (req, res) => {
  res.json({ usuario: req.usuario })
}

module.exports = { register, login, me }
