/**
 * Middleware global de tratamento de erros.
 * Deve ser registrado por último no server.js.
 */
module.exports = (err, req, res, next) => {
  console.error(`[ERRO] ${req.method} ${req.path}:`, err.message)

  // Erros de validação do Mongoose
  if (err.name === "ValidationError") {
    const mensagens = Object.values(err.errors).map((e) => e.message)
    return res.status(400).json({ erro: mensagens.join("; ") })
  }

  // Erros de cast do Mongoose (ID inválido)
  if (err.name === "CastError") {
    return res.status(400).json({ erro: "ID inválido" })
  }

  // Duplicidade de campo único
  if (err.code === 11000) {
    const campo = Object.keys(err.keyValue)[0]
    return res.status(400).json({ erro: `${campo} já está em uso` })
  }

  const status = err.status || 500
  const mensagem = status === 500 ? "Erro interno do servidor" : err.message
  res.status(status).json({ erro: mensagem })
}
