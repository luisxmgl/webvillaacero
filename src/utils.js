// Equivalente web de Utils.kt, los getters de Producto.kt y PointsManager.kt

export const WHATSAPP_NUMBER = "56920680021"

export function formatPrice(precio) {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(precio)
}

// Convierte un producto "crudo" del catálogo en un producto con sus campos calculados,
// igual que los getters de la data class Producto en Kotlin.
export function buildProducto(raw, colegioNombre) {
  const precio = Math.trunc(parseFloat(raw.precioxpublico)) || 0
  const stock = Math.trunc(parseFloat(raw.existencia)) || 0
  const nombre = raw.producto.trim()
  const nombreUpper = nombre.toUpperCase()

  const tallaIndex = nombreUpper.indexOf(" TALLA ")
  const talla = tallaIndex !== -1 ? nombre.substring(tallaIndex + 7).trim() : "N/A"

  let costMultiplier = 1.0
  if (nombreUpper.includes("PARKA") || nombreUpper.includes("CASACA")) costMultiplier = 1.2
  else if (nombreUpper.includes("POLERA")) costMultiplier = 0.9
  const puntosCost = Math.max(1000, Math.trunc(Math.floor(precio / 10) * costMultiplier))

  const puntosEarn = calculateStablePointsEarn(raw.idproducto || nombre)

  let descripcion
  if (nombreUpper.includes("POLERON")) {
    descripcion =
      "Polerón de alta calidad con interior de franela suave, ideal para mantener la temperatura corporal durante los días fríos. Cuenta con costuras reforzadas en hombros y cuello para una mayor durabilidad ante el uso diario. Tela de composición mixta que asegura que no encoja ni pierda su color original tras los lavados."
  } else if (nombreUpper.includes("POLERA")) {
    descripcion =
      "Polera confeccionada en tela altamente respirable y cómoda, ideal para el movimiento constante. Cuello y puños con tejido reforzado que mantiene su forma lavado tras lavado. Costuras planas para evitar roces molestos y asegurar el confort durante toda la jornada escolar."
  } else if (nombreUpper.includes("BUZO") || nombreUpper.includes("PANTALON")) {
    descripcion =
      "Prenda fabricada en tela de alta resistencia al roce y al uso intenso. Cuenta con pretina elástica reforzada para un ajuste seguro y cómodo. El tejido permite una excelente libertad de movimiento, siendo ideal tanto para clases normales como para educación física."
  } else if (nombreUpper.includes("CASACA")) {
    descripcion =
      "Casaca térmica con capa exterior repelente a la humedad y forro interior abrigado. Posee cierres de alta calidad y puños ajustables para proteger contra el viento y el frío. Diseño ergonómico pensado para la máxima comodidad del estudiante."
  } else if (nombreUpper.includes("FALDA") || nombreUpper.includes("JUMPER")) {
    descripcion =
      "Confeccionado en tela de sarga de alta resistencia con terminaciones prolijas. El material es resistente a las arrugas y mantiene el color firme por mucho más tiempo. Diseño clásico con calce cómodo para el uso diario prolongado."
  } else if (nombreUpper.includes("PARKA")) {
    descripcion =
      "Parka impermeable de alto rendimiento con aislamiento térmico superior. Protege eficazmente contra la lluvia y el viento, manteniendo al estudiante seco y temperado. Incluye bolsillos funcionales y terminaciones reforzadas."
  } else {
    descripcion =
      "Uniforme de alta calidad, confeccionado con telas resistentes y duraderas. Diseñado específicamente para cumplir con las exigencias del uso escolar diario, ofreciendo un equilibrio perfecto entre comodidad, durabilidad y una excelente presentación personal."
  }

  return {
    idproducto: raw.idproducto,
    nombre,
    precio,
    stock,
    talla,
    colegio: colegioNombre,
    puntosCost,
    puntosEarn,
    descripcion,
  }
}

function calculateStablePointsEarn(seed) {
  const hash = String(seed)
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0)
  const random = ((hash % 96) + 5)
  return Math.min(100, Math.max(5, random))
}

export function openWhatsApp(message, phone = WHATSAPP_NUMBER) {
  const cleanPhone = phone.replace(/[^0-9]/g, "")
  const url = message
    ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`
    : `https://wa.me/${cleanPhone}`
  window.open(url, "_blank")
}

export function generateOrderCode() {
  const now = new Date()
  const dd = String(now.getDate()).padStart(2, "0")
  const mm = String(now.getMonth() + 1).padStart(2, "0")
  const random = String(Math.floor(1000 + Math.random() * 9000))
  return `${dd[0]}${mm[0]}${random[0]}${random[1]}`
}

// --- Puntos de fidelidad (equivalente a PointsManager.kt, usa localStorage) ---
const POINTS_KEY = "villaacero_points"

export function getPoints() {
  return parseInt(localStorage.getItem(POINTS_KEY) || "0", 10)
}

export function addPoints(amount) {
  localStorage.setItem(POINTS_KEY, String(getPoints() + amount))
}

export function redeemPoints(amount) {
  const current = getPoints()
  if (current >= amount) {
    localStorage.setItem(POINTS_KEY, String(current - amount))
    return true
  }
  return false
}

export function calculateTotalPoints(items) {
  return items.reduce((sum, item) => sum + item.producto.puntosEarn * item.cantidad, 0)
}

// --- Pedidos guardados localmente (equivalente a LocalOrdersManager.kt) ---
const ORDERS_KEY = "villaacero_orders"

export function saveLocalOrder(code) {
  const orders = getLocalOrders()
  orders.unshift(code)
  localStorage.setItem(ORDERS_KEY, JSON.stringify(orders))
}

export function getLocalOrders() {
  try {
    return JSON.parse(localStorage.getItem(ORDERS_KEY) || "[]")
  } catch {
    return []
  }
}

// --- Identificador de invitado para el chat (equivalente a getUniqueUserId) ---
export function getGuestId() {
  let id = localStorage.getItem("villaacero_guest_id")
  if (!id) {
    id = "Invitado_" + Math.random().toString(36).slice(2, 10)
    localStorage.setItem("villaacero_guest_id", id)
  }
  return id
}

// --- Identidad de la sesión actual: distingue admin de cada invitado, para que
// el carrito, los puntos y los pedidos de una persona no se filtren a la siguiente
// persona que use el mismo navegador (ver CartContext.jsx, donde se usa para
// limpiar el estado personal cada vez que la identidad cambia). ---
export function getCurrentIdentity() {
  return localStorage.getItem("va_isAdmin") === "1" ? "admin" : getGuestId()
}

export function resetPersonalState() {
  localStorage.removeItem(POINTS_KEY)
  localStorage.removeItem(ORDERS_KEY)
}
