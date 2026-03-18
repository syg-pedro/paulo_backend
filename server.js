require("dotenv").config()

const express = require("express")
const cors = require("cors")
const swaggerUi = require("swagger-ui-express")
let swaggerSpec = null
try {
  swaggerSpec = require("./config/swagger")
} catch (e) {
  console.error("Swagger nao carregado:", e.message)
}

const conectarBanco = require("./config/database")
const errorHandler = require("./middlewares/errorHandler")

const authRoutes = require("./routes/auth")
const consultaRoutes = require("./routes/consultas")
const externalRoutes = require("./routes/external")

const app = express()

// ── CORS — aceita localhost (dev) + URL do frontend em producao ───────────────
const origensPermitidas = [
  "http://localhost:5173",
  "http://localhost:3000",
  process.env.FRONTEND_URL,
].filter(Boolean)

const corsOptions = {
  origin: (origin, callback) => {
    // Permite requisicoes sem origin (Postman, curl, servidor)
    if (!origin) return callback(null, true)
    if (origensPermitidas.includes(origin)) return callback(null, true)
    callback(new Error(`CORS bloqueado para origin: ${origin}`))
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
}

// Responde ao preflight OPTIONS de todas as rotas (Express 5: usa /{*path})
app.options("/{*path}", cors(corsOptions))
app.use(cors(corsOptions))

app.use(express.json())

// ── Swagger ───────────────────────────────────────────────────────────────────
if (swaggerSpec) {
  app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customSiteTitle: "Clinica API — Docs",
    customCss: ".swagger-ui .topbar { background-color: #1e293b; }",
    customCssUrl: "https://unpkg.com/swagger-ui-dist@5/swagger-ui.css",
    customJs: [
      "https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js",
      "https://unpkg.com/swagger-ui-dist@5/swagger-ui-standalone-preset.js",
    ],
  }))
  app.get("/api/docs.json", (req, res) => res.json(swaggerSpec))
}

// ── Middleware de conexao lazy (essencial para serverless) ────────────────────
app.use(async (req, res, next) => {
  try {
    await conectarBanco()
    next()
  } catch (err) {
    res.status(503).json({ erro: "Servico temporariamente indisponivel. Tente novamente." })
  }
})

// ── Rotas ─────────────────────────────────────────────────────────────────────
app.get("/", (req, res) => res.json({ mensagem: "API da Clinica funcionando", docs: "/api/docs" }))

app.use("/api/auth", authRoutes)
app.use("/api/consultas", consultaRoutes)
app.use("/api", externalRoutes)

// ── Rota nao encontrada ───────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ erro: `Rota ${req.method} ${req.path} nao encontrada` })
})

// ── Tratamento global de erros ────────────────────────────────────────────────
app.use(errorHandler)

// ── Inicializacao: local (listen) ou Vercel (export) ─────────────────────────
if (require.main === module) {
  // Rodando localmente via "node server.js" ou "nodemon"
  const PORT = process.env.PORT || 3000
  conectarBanco().then(() => {
    app.listen(PORT, () => {
      console.log(`Servidor rodando em http://localhost:${PORT}`)
    })
  })
} else {
  // Ambiente serverless (Vercel) — conexao lazy por request, exporta o app
  module.exports = app
}
