const mongoose = require("mongoose")

const ConsultaSchema = new mongoose.Schema(
  {
    pacienteId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "ID do paciente é obrigatório"],
    },
    nomePaciente: {
      type: String,
      required: [true, "Nome do paciente é obrigatório"],
      trim: true,
    },
    data: {
      type: String,
      required: [true, "Data é obrigatória"],
      match: [/^\d{4}-\d{2}-\d{2}$/, "Formato de data inválido (use YYYY-MM-DD)"],
    },
    horario: {
      type: String,
      required: [true, "Horário é obrigatório"],
      match: [/^\d{2}:\d{2}$/, "Formato de horário inválido (use HH:MM)"],
    },
    especialidade: {
      type: String,
      required: [true, "Especialidade é obrigatória"],
      trim: true,
    },
    status: {
      type: String,
      enum: ["pendente", "confirmado", "cancelado"],
      default: "pendente",
    },
    observacoes: {
      type: String,
      trim: true,
      default: "",
    },
  },
  { timestamps: true }
)

module.exports = mongoose.model("Consulta", ConsultaSchema)
