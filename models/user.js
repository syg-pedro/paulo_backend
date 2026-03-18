const mongoose = require("mongoose")

const UserSchema = new mongoose.Schema(
  {
    nome: {
      type: String,
      required: [true, "Nome é obrigatório"],
      trim: true,
      minlength: [2, "Nome deve ter ao menos 2 caracteres"],
    },
    email: {
      type: String,
      required: [true, "Email é obrigatório"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Formato de email inválido"],
    },
    senha: {
      type: String,
      required: true,
    },
    tipo: {
      type: String,
      enum: ["paciente", "secretario"],
      default: "paciente",
    },
  },
  { timestamps: true }
)

// Nunca expor a senha ao serializar o objeto
UserSchema.methods.toJSON = function () {
  const obj = this.toObject()
  delete obj.senha
  return obj
}

module.exports = mongoose.model("User", UserSchema)
