const Consulta = require("../models/consulta")

/**
 * POST /api/consultas
 * Cria uma nova consulta. Verifica conflito de horário na mesma especialidade.
 */
const criar = async (req, res, next) => {
  try {
    const { nomePaciente, data, horario, especialidade, observacoes } = req.body

    if (!nomePaciente || !data || !horario || !especialidade) {
      return res.status(400).json({ erro: "Preencha todos os campos obrigatórios" })
    }

    // Verifica conflito: mesma especialidade, data e horário
    const conflito = await Consulta.findOne({ data, horario, especialidade })
    if (conflito) {
      return res.status(409).json({
        erro: `Horário ${horario} já está ocupado para ${especialidade} no dia ${data}`,
      })
    }

    const consulta = await Consulta.create({
      pacienteId: req.usuario._id,
      nomePaciente,
      data,
      horario,
      especialidade,
      observacoes: observacoes || "",
    })

    res.status(201).json({ mensagem: "Consulta agendada com sucesso", consulta })
  } catch (err) {
    next(err)
  }
}

/**
 * GET /api/consultas
 * Retorna consultas. Secretários veem todas; pacientes veem apenas as suas.
 * Suporta filtro por status e data via query params.
 */
const listar = async (req, res, next) => {
  try {
    const { status, data } = req.query
    const filtro = {}

    if (req.usuario.tipo === "paciente") {
      filtro.pacienteId = req.usuario._id
    }

    if (status) filtro.status = status
    if (data) filtro.data = data

    const consultas = await Consulta.find(filtro).sort({ data: 1, horario: 1 })

    res.json({ total: consultas.length, consultas })
  } catch (err) {
    next(err)
  }
}

/**
 * GET /api/consultas/:id
 * Retorna uma consulta específica.
 */
const buscarPorId = async (req, res, next) => {
  try {
    const consulta = await Consulta.findById(req.params.id)

    if (!consulta) {
      return res.status(404).json({ erro: "Consulta não encontrada" })
    }

    // Paciente só pode ver suas próprias consultas
    if (
      req.usuario.tipo === "paciente" &&
      consulta.pacienteId.toString() !== req.usuario._id.toString()
    ) {
      return res.status(403).json({ erro: "Acesso negado" })
    }

    res.json({ consulta })
  } catch (err) {
    next(err)
  }
}

/**
 * PUT /api/consultas/:id/status
 * Atualiza o status de uma consulta. Apenas secretários.
 */
const atualizarStatus = async (req, res, next) => {
  try {
    const { status } = req.body
    const statusValidos = ["pendente", "confirmado", "cancelado"]

    if (!status || !statusValidos.includes(status)) {
      return res.status(400).json({ erro: `Status inválido. Use: ${statusValidos.join(", ")}` })
    }

    const consulta = await Consulta.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    )

    if (!consulta) {
      return res.status(404).json({ erro: "Consulta não encontrada" })
    }

    res.json({ mensagem: "Status atualizado com sucesso", consulta })
  } catch (err) {
    next(err)
  }
}

/**
 * DELETE /api/consultas/:id
 * Remove uma consulta. Paciente só pode cancelar as suas. Secretário pode remover qualquer uma.
 */
const remover = async (req, res, next) => {
  try {
    const consulta = await Consulta.findById(req.params.id)

    if (!consulta) {
      return res.status(404).json({ erro: "Consulta não encontrada" })
    }

    if (
      req.usuario.tipo === "paciente" &&
      consulta.pacienteId.toString() !== req.usuario._id.toString()
    ) {
      return res.status(403).json({ erro: "Você não pode remover uma consulta de outro paciente" })
    }

    await consulta.deleteOne()

    res.json({ mensagem: "Consulta removida com sucesso" })
  } catch (err) {
    next(err)
  }
}

module.exports = { criar, listar, buscarPorId, atualizarStatus, remover }
