const axios = require("axios")

/**
 * Busca o endereço completo a partir de um CEP usando a API ViaCEP.
 * @param {string} cep - CEP com 8 dígitos numéricos
 * @returns {Object} Endereço formatado
 */
const buscarEndereco = async (cep) => {
  const url = `https://viacep.com.br/ws/${cep}/json/`

  let resposta
  try {
    resposta = await axios.get(url, { timeout: 5000 })
  } catch (err) {
    const erro = new Error("Serviço ViaCEP indisponível. Tente novamente mais tarde.")
    erro.status = 503
    throw erro
  }

  if (resposta.data.erro) {
    const erro = new Error("CEP não encontrado")
    erro.status = 404
    throw erro
  }

  const { logradouro, bairro, localidade, uf, cep: cepFormatado } = resposta.data

  return {
    cep: cepFormatado,
    logradouro,
    bairro,
    cidade: localidade,
    estado: uf,
    enderecoCompleto: `${logradouro}, ${bairro}, ${localidade} - ${uf}`,
  }
}

module.exports = { buscarEndereco }
