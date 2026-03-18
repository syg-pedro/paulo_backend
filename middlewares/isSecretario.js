/**
 * Middleware de autorização por papel (RBAC).
 * Deve ser usado APÓS o middleware auth.
 * Permite acesso apenas para usuários do tipo "secretario".
 */
module.exports = (req, res, next) => {
  if (!req.usuario || req.usuario.tipo !== "secretario") {
    return res.status(403).json({ erro: "Acesso negado. Apenas secretários podem realizar esta ação." })
  }
  next()
}
