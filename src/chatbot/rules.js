export function buildDefaultRules(t) {
  return [
    {
      id: "orderHelp",
      keywords: ["pedido", "orden", "encomenda", "commande", "order", "tracking", "rastre", "retiro"],
      action: "ASK_ORDER_CODE",
    },
    {
      id: "sizes",
      keywords: ["talla", "tamano", "tamanho", "size", "taille"],
      answer: t("chatbot.sizes"),
    },
    {
      id: "delivery",
      keywords: ["demora", "entrega", "tiempo de", "delivery", "delai", "livraison", "prazo"],
      answer: t("chatbot.delivery"),
    },
    {
      id: "payment",
      keywords: ["pago", "pagar", "webpay", "tarjeta", "payment", "paiement", "pagamento", "transferencia"],
      answer: t("chatbot.payment"),
    },
    {
      id: "location",
      keywords: ["ubicacion", "direccion", "donde estan", "location", "adresse", "endereco", "where are"],
      answer: t("chatbot.location"),
    },
    {
      id: "schedule",
      keywords: ["horario", "atienden", "schedule", "horaire", "horario de atendimento", "hours"],
      answer: t("chatbot.schedule"),
    },
    {
      id: "returns",
      keywords: ["cambio", "devolucion", "return", "garantia", "garantie", "troca"],
      answer: t("chatbot.returns"),
    },
    {
      id: "customization",
      keywords: ["bordado", "personaliz", "ajuste de medida", "embroidery", "customiz", "broderie", "bordar"],
      answer: t("chatbot.customization"),
    },
    {
      id: "pricing",
      keywords: ["precio", "cuesta", "vale", "price", "prix", "preco", "cuanto sale"],
      answer: t("chatbot.pricing"),
    },
    {
      id: "human",
      keywords: ["hablar con alguien", "persona real", "asesor", "talk to a person", "atendente", "parler a quelqu'un", "human"],
      answer: t("chatbot.humanHandoff"),
      flagHuman: true,
    },
    {
      id: "thanks",
      keywords: ["gracias", "thanks", "thank you", "merci", "obrigad"],
      answer: t("chatbot.thanks"),
    },
    {
      id: "farewell",
      keywords: ["chao", "adios", "bye", "au revoir", "tchau", "hasta luego"],
      answer: t("chatbot.farewell"),
    },
    {
      id: "greeting",
      keywords: ["hola", "buenas", "hello", "hi", "bonjour", "ola", "buen dia"],
      answer: t("chatbot.greetingWord"),
    },
  ]
}

function normalize(text) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
}

export function matchRule(text, rules) {
  const normalized = normalize(text)
  return rules.find((r) => r.keywords.some((k) => normalized.includes(normalize(k)))) || null
}

export function extractOrderCode(text) {
  const match = text.match(/\b[a-zA-Z0-9]{4}\b/)
  return match ? match[0] : null
}
