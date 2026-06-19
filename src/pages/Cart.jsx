import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { ref, set } from "firebase/database"
import { db } from "../firebase.js"
import { useCart } from "../context/CartContext.jsx"
import { useLanguage } from "../context/LanguageContext.jsx"
import {
  formatPrice,
  openWhatsApp,
  openWebpay,
  generateOrderCode,
  saveLocalOrder,
  addPoints,
  calculateTotalPoints,
} from "../utils.js"
import CheckoutAssistant from "../components/CheckoutAssistant.jsx"
import ConfirmationModal from "../components/ConfirmationModal.jsx"

export default function Cart() {
  const navigate = useNavigate()
  const { items, updateQuantity, removeItem, clear, total } = useCart()
  const { t } = useLanguage()
  const [showAssistant, setShowAssistant] = useState(false)
  const [pendingMethod, setPendingMethod] = useState(null) // "whatsapp" | "webpay"
  const [confirmedCode, setConfirmedCode] = useState(null)

  const pointsToEarn = calculateTotalPoints(items)

  function iniciarCheckout(method) {
    setPendingMethod(method)
    setShowAssistant(true)
  }

  async function onAssistantComplete(extraCharge, customization) {
    setShowAssistant(false)
    const orderCode = generateOrderCode()
    const totalFinal = total + extraCharge

    const pedido = {
      id: orderCode,
      codigoRetiro: orderCode,
      items: items.map((i) => ({
        nombre: i.producto.nombre,
        talla: i.producto.talla,
        precio: i.producto.precio,
        cantidad: i.cantidad,
        colegio: i.producto.colegio,
      })),
      total,
      extraCharge,
      customization,
      estado: 1,
      fecha: Date.now(),
      procesado: false,
    }

    saveLocalOrder(orderCode)
    try {
      await set(ref(db, `pedidos/${orderCode}`), pedido)
    } catch (e) {
      console.error("Error al guardar en Firebase", e)
    }

    addPoints(pointsToEarn)

    if (pendingMethod === "whatsapp") {
      let msg = `${t("cart.orderMessageHeader")}\n\n${t("cart.orderCodeLabel")}: ${orderCode}\n------------------------------\n`
      items.forEach((i) => {
        msg += `• ${i.producto.nombre}\n  ${t("cart.quantityLabel")}: ${i.cantidad}\n`
        if (i.producto.colegio) msg += `  ${t("cart.schoolLabel")}: ${i.producto.colegio}\n`
        msg += "\n"
      })
      if (customization) {
        msg += `${t("cart.adjustmentsLabel")}: ${customization}\n${t("cart.extraChargeLabel")}: ${formatPrice(extraCharge)}\n\n`
      }
      msg += `${t("cart.finalTotalLabel")}: ${formatPrice(totalFinal)}\n\n*${t("cart.changeNote")}*`
      openWhatsApp(msg)
    } else {
      openWebpay()
    }

    clear()
    setConfirmedCode(orderCode)
  }

  if (confirmedCode) {
    return (
      <ConfirmationModal
        orderCode={confirmedCode}
        onClose={() => {
          setConfirmedCode(null)
          navigate(-1)
        }}
      />
    )
  }

  return (
    <div className="screen">
      <div className="topbar">
        <button className="back" onClick={() => navigate(-1)} aria-label="Volver">
          ←
        </button>
        <h1 style={{ flex: 1 }}>{t("cart.title")}</h1>
      </div>

      <div className="content">
        {items.length === 0 ? (
          <div className="empty-state">
            <div className="glyph">VA</div>
            {t("cart.empty")}
            <div style={{ marginTop: 18 }}>
              <button className="btn btn-outline" onClick={() => navigate(-1)}>
                {t("cart.continueShopping")}
              </button>
            </div>
          </div>
        ) : (
          <>
            {items.map((item) => (
              <div key={item.producto.idproducto} className="stitch-card" style={{ marginBottom: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{item.producto.nombre}</div>
                  <div style={{ color: "var(--thread)", fontFamily: "var(--font-display)", fontSize: 15 }}>
                    {formatPrice(item.producto.precio)}
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <button className="btn-ghost" style={{ background: "none", border: "1px solid var(--line)", borderRadius: 4, width: 28, height: 28 }} onClick={() => updateQuantity(item.producto.idproducto, -1)}>
                    −
                  </button>
                  <span>{item.cantidad}</span>
                  <button className="btn-ghost" style={{ background: "none", border: "1px solid var(--line)", borderRadius: 4, width: 28, height: 28 }} onClick={() => updateQuantity(item.producto.idproducto, 1)}>
                    +
                  </button>
                </div>
              </div>
            ))}

            <button className="btn btn-ghost" onClick={clear}>
              {t("cart.clearCart")}
            </button>

            <hr className="stitch-divider" />

            <div className="stitch-card">
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, marginBottom: 6 }}>
                <span>{t("cart.subtotal")}</span>
                <span>{formatPrice(total)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 18 }}>
                <span>{t("cart.total")}</span>
                <span style={{ color: "var(--thread)" }}>{formatPrice(total)}</span>
              </div>
              <p style={{ fontSize: 12.5, color: "var(--muted)", marginTop: 8 }}>
                {t("cart.pointsEarn", { points: pointsToEarn })}
              </p>
            </div>

            <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => iniciarCheckout("whatsapp")}>
              {t("cart.checkoutWhatsapp")}
            </button>
            <button className="btn btn-secondary" style={{ marginTop: 10 }} onClick={() => iniciarCheckout("webpay")}>
              {t("cart.checkoutWebpay")}
            </button>
          </>
        )}
      </div>

      {showAssistant && (
        <CheckoutAssistant onComplete={onAssistantComplete} onClose={() => setShowAssistant(false)} />
      )}
    </div>
  )
}
