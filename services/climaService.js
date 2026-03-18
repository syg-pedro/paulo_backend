const axios = require("axios")

/**
 * Verifica se há previsão de chuva em uma cidade para uma data específica.
 * Usa a API OpenWeatherMap Forecast (gratuita — dados de até 5 dias).
 * A API key é lida das variáveis de ambiente — NUNCA exposta ao frontend.
 *
 * @param {string} cidade - Nome da cidade (ex: "Salvador")
 * @param {string} data   - Data no formato "YYYY-MM-DD"
 * @returns {{ temChuva: boolean, descricao: string, avisos: string[] }}
 */
const verificarChuva = async (cidade, data) => {
  const apiKey = process.env.OPENWEATHER_API_KEY

  if (!apiKey) {
    const erro = new Error("Chave da API de clima não configurada")
    erro.status = 503
    throw erro
  }

  const url = "https://api.openweathermap.org/data/2.5/forecast"

  let resposta
  try {
    resposta = await axios.get(url, {
      params: {
        q: cidade,
        appid: apiKey,
        units: "metric",
        lang: "pt_br",
        cnt: 40, // máximo de entradas (5 dias × 8 previsões por dia)
      },
      timeout: 8000,
    })
  } catch (err) {
    if (err.response && err.response.status === 404) {
      const erro = new Error(`Cidade "${cidade}" não encontrada na API de clima`)
      erro.status = 404
      throw erro
    }
    const erro = new Error("Serviço de clima indisponível. Tente novamente mais tarde.")
    erro.status = 503
    throw erro
  }

  const previsoesDoDia = resposta.data.list.filter((item) => item.dt_txt.startsWith(data))

  if (previsoesDoDia.length === 0) {
    return {
      temChuva: false,
      descricao: "Sem previsão disponível para esta data (limite de 5 dias)",
      avisos: [],
    }
  }

  const descricoes = previsoesDoDia.map((p) => p.weather[0].description)
  const temChuva = previsoesDoDia.some((p) =>
    ["rain", "drizzle", "thunderstorm"].includes(p.weather[0].main.toLowerCase())
  )

  const tempMin = Math.min(...previsoesDoDia.map((p) => p.main.temp_min))
  const tempMax = Math.max(...previsoesDoDia.map((p) => p.main.temp_max))

  const avisos = []
  if (temChuva) avisos.push("⚠️ Há previsão de chuva no dia da consulta. Leve um guarda-chuva!")

  return {
    temChuva,
    cidade: resposta.data.city.name,
    data,
    descricao: [...new Set(descricoes)].join(", "),
    temperatura: { min: tempMin.toFixed(1), max: tempMax.toFixed(1) },
    avisos,
  }
}

module.exports = { verificarChuva }
