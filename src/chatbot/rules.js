export function buildDefaultRules(t) {
  return [
    {
      id: "orderHelp",
      keywords: [
        "pedido", "orden", "encomenda", "commande", "order", "tracking", "rastre", "retiro",
        "estado de mi pedido", "donde esta mi pedido", "mi pedido", "numero de pedido",
        "codigo de pedido", "ya llego mi pedido", "ya esta listo mi pedido",
      ],
      action: "ASK_ORDER_CODE",
    },
    {
      id: "schools",
      keywords: [
        "que colegios", "qué colegios", "colegios atienden", "colegios trabajan",
        "con que colegios trabajan", "colegios tienen", "que colegios hay", "lista de colegios",
        "colegios disponibles", "para que colegios", "trabajan con mi colegio", "que escuelas",
        "qué escuelas", "escuelas atienden", "which schools", "what schools", "school list",
        "quels etablissements", "quelles ecoles", "quais escolas", "quais colegios",
      ],
      answer: t("chatbot.schools"),
    },
    {
      id: "sizes",
      keywords: [
        "talla", "tamano", "tamanho", "size", "taille",
        "tallas disponibles", "que talla", "qué talla", "guia de tallas", "tabla de tallas",
        "talla correcta", "talla recomendada", "no se que talla", "no sé qué talla",
      ],
      answer: t("chatbot.sizes"),
    },
    {
      id: "delivery",
      keywords: [
        "demora", "entrega", "tiempo de", "delivery", "delai", "livraison", "prazo",
        "cuanto se demora", "cuánto se demora", "cuanto tarda", "cuánto tarda",
        "tiempo de confeccion", "tiempo de fabricacion", "tiempo de produccion", "dias habiles",
        "cuantos dias demora", "cuándo llega",
      ],
      answer: t("chatbot.delivery"),
    },
    {
      id: "payment",
      keywords: [
        "pago", "pagar", "webpay", "tarjeta", "payment", "paiement", "pagamento", "transferencia",
        "se puede pagar con", "aceptan transferencia", "aceptan debito", "aceptan credito",
        "como pago", "formas de pago", "medios de pago",
      ],
      answer: t("chatbot.payment"),
    },
    {
      id: "location",
      keywords: [
        "ubicacion", "direccion", "donde estan", "location", "adresse", "endereco", "where are",
        "como llego", "cómo llego", "como llegar", "cómo llegar", "estan ubicados",
        "cual es la direccion", "cuál es la dirección", "donde queda la tienda",
        "donde se encuentran", "dónde se encuentran",
      ],
      answer: t("chatbot.location"),
    },
    {
      id: "schedule",
      keywords: [
        "horario", "atienden", "schedule", "horaire", "horario de atendimento", "hours",
        "a que hora abren", "a qué hora abren", "a que hora cierran", "a qué hora cierran",
        "que horario tienen", "qué horario tienen", "estan abiertos", "están abiertos",
        "horario de atencion", "horario de atención", "abren los sabados", "trabajan los domingos",
      ],
      answer: t("chatbot.schedule"),
    },
    {
      id: "returns",
      keywords: [
        "cambio", "devolucion", "return", "garantia", "garantie", "troca",
        "puedo cambiar", "se puede devolver", "politica de cambio", "política de cambio",
        "no me gusto la talla", "no me gustó la talla", "quiero cambiar la talla",
      ],
      answer: t("chatbot.returns"),
    },
    {
      id: "customization",
      keywords: [
        "bordado", "personaliz", "ajuste de medida", "embroidery", "customiz", "broderie", "bordar",
        "se puede personalizar", "agregar nombre", "bordar nombre", "ajustar el largo", "hacer ajustes",
      ],
      answer: t("chatbot.customization"),
    },
    {
      id: "pricing",
      keywords: [
        "precio", "cuesta", "vale", "price", "prix", "preco", "cuanto sale",
        "cuanto cuesta", "cuánto cuesta", "cuanto vale", "cuánto vale", "valor del",
        "lista de precios", "tienen precios",
      ],
      answer: t("chatbot.pricing"),
    },
    {
      id: "human",
      keywords: [
        "hablar con alguien", "persona real", "asesor", "talk to a person", "atendente",
        "parler a quelqu'un", "human", "quiero hablar con una persona", "necesito un asesor",
        "atencion humana", "atención humana", "quiero hablar con alguien real",
      ],
      answer: t("chatbot.humanHandoff"),
      flagHuman: true,
    },
    {
      id: "thanks",
      keywords: ["gracias", "thanks", "thank you", "merci", "obrigad", "muchas gracias", "te pasaste"],
      answer: t("chatbot.thanks"),
    },
    {
      id: "farewell",
      keywords: ["chao", "adios", "bye", "au revoir", "tchau", "hasta luego", "nos vemos", "hasta pronto"],
      answer: t("chatbot.farewell"),
    },
    {
      id: "greeting",
      keywords: ["hola", "buenas", "hello", "hi", "bonjour", "ola", "buen dia", "buenas tardes", "buenas noches", "que tal"],
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
  let best = null
  let bestLength = 0
  for (const rule of rules) {
    for (const keyword of rule.keywords) {
      const normKeyword = normalize(keyword)
      if (normKeyword && normalized.includes(normKeyword) && normKeyword.length > bestLength) {
        best = rule
        bestLength = normKeyword.length
      }
    }
  }
  return best
}

export function extractOrderCode(text) {
  const match = text.match(/\b[a-zA-Z0-9]{4}\b/)
  return match ? match[0] : null
}
