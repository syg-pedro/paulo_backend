const cepService = require("../services/cepService")
const climaService = require("../services/climaService")

/**
 * GET /api/cep/:cep
 * Busca o endereço a partir de um CEP via ViaCEP.
 * Rota pública — não requer autenticação.
 */
const buscarCep = async (req, res, next) => {
  try {
    const { cep } = req.params

    if (!/^\d{8}$/.test(cep)) {
      return res.status(400).json({ erro: "CEP inválido. Use 8 dígitos numéricos (sem traço)" })
    }

    const endereco = await cepService.buscarEndereco(cep)
    res.json({ endereco })
  } catch (err) {
    next(err)
  }
}

/**
 * GET /api/clima?cidade=Salvador&data=2025-12-01
 * Verifica a previsão de clima para um dia específico.
 * A API key fica no backend — nunca exposta ao frontend.
 * Requer autenticação.
 */
const verificarClima = async (req, res, next) => {
  try {
    const { cidade, data } = req.query

    if (!cidade || !data) {
      return res.status(400).json({ erro: "Informe cidade e data (YYYY-MM-DD)" })
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(data)) {
      return res.status(400).json({ erro: "Formato de data inválido. Use YYYY-MM-DD" })
    }

    const resultado = await climaService.verificarChuva(cidade, data)
    res.json(resultado)
  } catch (err) {
    next(err)
  }
}

module.exports = { buscarCep, verificarClima }
