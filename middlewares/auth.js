const jwt = require("jsonwebtoken")
const User = require("../models/user")

/**
 * Middleware de autenticação JWT.
 * Verifica o token no header Authorization: Bearer <token>
 * e injeta req.usuario com os dados do usuário autenticado.
 */
module.exports = async (req, res, next) => {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ erro: "Token não fornecido ou mal formatado" })
  }

  const token = authHeader.split(" ")[1]

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    const usuario = await User.findById(decoded.id)
    if (!usuario) {
      return res.status(401).json({ erro: "Usuário não encontrado" })
    }

    req.usuario = usuario
    next()
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ erro: "Token expirado, faça login novamente" })
    }
    return res.status(401).json({ erro: "Token inválido" })
  }
}
