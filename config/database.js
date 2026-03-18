const mongoose = require("mongoose")

// Reutiliza a conexao entre invocacoes serverless (Vercel)
let conectado = false

const conectarBanco = async () => {
  if (conectado && mongoose.connection.readyState === 1) return

  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
    })
    conectado = true
    console.log("Banco de dados conectado")
  } catch (err) {
    conectado = false
    console.error("Erro ao conectar no banco:", err.message)
    // Nao usar process.exit em serverless — lanca o erro para o caller tratar
    throw err
  }
}

module.exports = conectarBanco
