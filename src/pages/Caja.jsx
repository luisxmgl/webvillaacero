import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { ref, set } from "firebase/database"
import { db } from "../firebase.js"
import { useCart } from "../context/CartContext.jsx"
import { useLanguage } from "../context/LanguageContext.jsx"
import { buildProducto, formatPrice, generateOrderCode, WHATSAPP_NUMBER } from "../utils.js"

const METODOS = ["efectivo", "tarjeta", "transferencia", "webpay"]
const IVA_RATE = 0.19

function formatWhatsApp(number) {
  const digits = number.replace(/[^0-9]/g, "")
  return `+${digits.slice(0, 2)} ${digits.slice(2, 3)} ${digits.slice(3, 7)} ${digits.slice(7)}`
}

export default function Caja() {
  const navigate = useNavigate()
  const { t } = useLanguage()
  const { items: ticket, addItem, updateQuantity, removeItem, clear, total } = useCart()

  useEffect(() => {
    if (localStorage.getItem("va_isAdmin") !== "1") navigate("/admin/login")
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const [colegios, setColegios] = useState([])
  const [query, setQuery] = useState("")
  const [step, setStep] = useState("ticket") // ticket | pago | recibo
  const [metodoPago, setMetodoPago] = useState(null)
  const [montoRecibido, setMontoRecibido] = useState("")
  const [saving, setSaving] = useState(false)
  const [warning, setWarning] = useState("")
  const [pedidoFinal, setPedidoFinal] = useState(null)

  useEffect(() => {
    fetch("/catalogo.json")
      .then((r) => r.json())
      .then(setColegios)
      .catch(() => setColegios([]))
  }, [])

  const productos = useMemo(
    () => colegios.flatMap((c) => (c.productos || []).map((p) => buildProducto(p, c.nombre))),
    [colegios]
  )

  const resultados = useMemo(() => {
    const q = query.trim().toUpperCase()
    if (!q) return []
    return productos.filter((p) => p.nombre.toUpperCase().includes(q)).slice(0, 30)
  }, [productos, query])
  const montoRecibidoNum = Number(montoRecibido) || 0
  const vuelto = montoRecibidoNum - total

  function metodoLabel(m) {
    return t(`caja.method${m.charAt(0).toUpperCase()}${m.slice(1)}`)
  }

  // Los precios ya incluyen IVA (como se muestran al cliente); se descompone para la boleta.
  const montoNeto = pedidoFinal ? Math.round(pedidoFinal.total / (1 + IVA_RATE)) : 0
  const montoIva = pedidoFinal ? pedidoFinal.total - montoNeto : 0

  const montosRapidos = useMemo(() => {
    if (!total) return []
    const redondeos = [1000, 2000, 5000, 10000, 20000]
    const candidatos = new Set([total])
    redondeos.forEach((r) => candidatos.add(Math.ceil(total / r) * r))
    return Array.from(candidatos)
      .filter((n) => n > 0)
      .sort((a, b) => a - b)
      .slice(0, 5)
  }, [total])

  function irAPago() {
    setStep("pago")
  }

  function volverATicket() {
    setStep("ticket")
  }

  async function confirmarVenta() {
    if (!metodoPago || metodoPago === "webpay") return
    if (metodoPago === "efectivo" && montoRecibidoNum < total) return

    setSaving(true)
    setWarning("")
    const orderCode = generateOrderCode()
    const pedido = {
      id: orderCode,
      codigoRetiro: orderCode,
      items: ticket.map((i) => ({
        nombre: i.producto.nombre,
        talla: i.producto.talla,
        precio: i.producto.precio,
        cantidad: i.cantidad,
        colegio: i.producto.colegio,
      })),
      total,
      extraCharge: 0,
      customization: "",
      estado: 4,
      fecha: Date.now(),
      procesado: true,
      origen: "pos",
      metodoPago,
      pagado: true,
      montoRecibido: metodoPago === "efectivo" ? montoRecibidoNum : null,
      vuelto: metodoPago === "efectivo" ? vuelto : null,
      cajero: null,
    }

    try {
      await set(ref(db, `pedidos/${orderCode}`), pedido)
    } catch (e) {
      console.error("Error al guardar venta de caja", e)
      setWarning(t("caja.saveWarning"))
    }

    clear()
    setPedidoFinal(pedido)
    setSaving(false)
    setStep("recibo")
  }

  function nuevaVenta() {
    setMetodoPago(null)
    setMontoRecibido("")
    setPedidoFinal(null)
    setWarning("")
    setQuery("")
    setStep("ticket")
  }

  return (
    <div className="screen">
      <div className="topbar">
        <button className="back" onClick={() => navigate("/admin/pedidos")} aria-label="Volver">
          ←
        </button>
        <h1 style={{ flex: 1, fontSize: 18 }}>{t("caja.title")}</h1>
      </div>

      <div className="content">
        {step === "ticket" && (
          <>
            <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
              <input
                placeholder={t("caja.searchPlaceholder")}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <button
                type="button"
                className="btn btn-outline"
                style={{ width: "auto", padding: "11px 16px", whiteSpace: "nowrap" }}
                onClick={() => navigate("/colegios")}
              >
                {t("caja.browseCatalog")}
              </button>
            </div>

            {query.trim() && (
              <div style={{ marginBottom: 18 }}>
                {resultados.length === 0 ? (
                  <p style={{ fontSize: 13, color: "var(--muted)" }}>{t("caja.noResults")}</p>
                ) : (
                  resultados.map((p) => (
                    <div
                      key={p.idproducto}
                      className="stitch-card"
                      style={{ marginBottom: 8, padding: 12, display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }}
                      onClick={() => addItem(p)}
                    >
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 13.5 }}>{p.nombre}</div>
                        <div style={{ fontSize: 12, color: "var(--muted)" }}>{p.colegio}</div>
                      </div>
                      <div style={{ fontFamily: "var(--font-display)", color: "var(--thread)", fontWeight: 700 }}>
                        {formatPrice(p.precio)}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            <hr className="stitch-divider" />

            {ticket.length === 0 ? (
              <div className="empty-state">
                <div className="glyph">$</div>
                {t("caja.ticketEmpty")}
              </div>
            ) : (
              <>
                {ticket.map((item) => (
                  <div
                    key={item.producto.idproducto}
                    className="stitch-card"
                    style={{ marginBottom: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{item.producto.nombre}</div>
                      <div style={{ color: "var(--thread)", fontFamily: "var(--font-display)", fontSize: 14 }}>
                        {formatPrice(item.producto.precio)}
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <button
                        className="btn-ghost"
                        style={{ background: "none", border: "1px solid var(--line)", borderRadius: 4, width: 28, height: 28 }}
                        onClick={() => updateQuantity(item.producto.idproducto, -1)}
                      >
                        −
                      </button>
                      <span>{item.cantidad}</span>
                      <button
                        className="btn-ghost"
                        style={{ background: "none", border: "1px solid var(--line)", borderRadius: 4, width: 28, height: 28 }}
                        onClick={() => updateQuantity(item.producto.idproducto, 1)}
                      >
                        +
                      </button>
                      <button
                        className="btn-ghost"
                        aria-label={t("caja.removeLine")}
                        title={t("caja.removeLine")}
                        style={{ background: "none", border: "1px solid var(--line)", borderRadius: 4, width: 28, height: 28, color: "var(--thread)" }}
                        onClick={() => removeItem(item.producto.idproducto)}
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))}

                <button className="btn btn-ghost" onClick={clear}>
                  {t("caja.clearTicket")}
                </button>

                <hr className="stitch-divider" />

                <div className="stitch-card">
                  <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 18 }}>
                    <span>{t("caja.total")}</span>
                    <span style={{ color: "var(--thread)" }}>{formatPrice(total)}</span>
                  </div>
                </div>

                <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={irAPago}>
                  {t("caja.continueToPayment")}
                </button>
              </>
            )}
          </>
        )}

        {step === "pago" && (
          <>
            <div className="stitch-card" style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 18 }}>
                <span>{t("caja.total")}</span>
                <span style={{ color: "var(--thread)" }}>{formatPrice(total)}</span>
              </div>
            </div>

            <p style={{ fontSize: 13.5, fontWeight: 600, marginBottom: 8 }}>{t("caja.paymentMethodTitle")}</p>

            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
              {METODOS.map((m) => (
                <button
                  key={m}
                  type="button"
                  className={`chip ${m === metodoPago ? "active" : ""}`}
                  disabled={m === "webpay"}
                  style={m === "webpay" ? { opacity: 0.5, cursor: "not-allowed" } : {}}
                  onClick={() => setMetodoPago(m)}
                >
                  {metodoLabel(m)}
                  {m === "webpay" && <span style={{ marginLeft: 6, fontSize: 11 }}>({t("caja.webpayComingSoon")})</span>}
                </button>
              ))}
            </div>

            {metodoPago === "efectivo" && (
              <div className="stitch-card" style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 13, color: "var(--muted)" }}>{t("caja.cashReceivedLabel")}</label>
                <input
                  type="number"
                  inputMode="numeric"
                  value={montoRecibido}
                  onChange={(e) => setMontoRecibido(e.target.value)}
                  style={{ marginTop: 6, marginBottom: 10 }}
                />
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 10 }}>
                  {montosRapidos.map((m) => (
                    <button key={m} type="button" className="chip" onClick={() => setMontoRecibido(String(m))}>
                      {formatPrice(m)}
                    </button>
                  ))}
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
                  <span>{t("caja.changeLabel")}</span>
                  <strong style={{ color: vuelto < 0 ? "var(--thread)" : "var(--success)" }}>{formatPrice(Math.max(vuelto, 0))}</strong>
                </div>
                {montoRecibidoNum > 0 && montoRecibidoNum < total && (
                  <p style={{ fontSize: 12.5, color: "var(--thread)", marginTop: 8 }}>{t("caja.insufficientCash")}</p>
                )}
              </div>
            )}

            {metodoPago === "tarjeta" && (
              <p className="chat-banner">{t("caja.cardNote")}</p>
            )}

            {metodoPago === "transferencia" && (
              <p className="chat-banner">{t("caja.transferNote")}</p>
            )}

            <button className="btn btn-ghost" onClick={volverATicket}>
              {t("caja.backToTicket")}
            </button>

            <button
              className="btn btn-primary"
              style={{ marginTop: 10 }}
              disabled={!metodoPago || metodoPago === "webpay" || saving || (metodoPago === "efectivo" && montoRecibidoNum < total)}
              onClick={confirmarVenta}
            >
              {saving ? t("caja.saving") : t("caja.confirmSale")}
            </button>
          </>
        )}

        {step === "recibo" && pedidoFinal && (
          <>
            {warning && <p className="chat-banner no-print" style={{ color: "var(--thread)" }}>{warning}</p>}

            <div className="receipt stitch-card">
              <div style={{ textAlign: "center" }}>
                <h2 style={{ fontFamily: "var(--font-display)", fontSize: 17, margin: 0 }}>Confecciones Villa Acero</h2>
                <p style={{ fontSize: 11.5, color: "var(--muted)", margin: "3px 0 0" }}>{t("caja.receiptTagline")}</p>
                <p style={{ fontSize: 11.5, color: "var(--muted)", margin: "2px 0 0" }}>
                  {t("caja.receiptContact")}: WhatsApp {formatWhatsApp(WHATSAPP_NUMBER)}
                </p>
              </div>

              <hr className="stitch-divider" style={{ margin: "10px 0" }} />

              <p style={{ textAlign: "center", fontWeight: 700, fontSize: 14, letterSpacing: "0.04em", margin: "0 0 8px" }}>
                {t("caja.receiptTitle").toUpperCase()}
              </p>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, marginBottom: 2 }}>
                <span>{t("caja.receiptCode")}</span>
                <strong>{pedidoFinal.codigoRetiro}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, marginBottom: 2 }}>
                <span>{t("caja.receiptDate")}</span>
                <span>{new Date(pedidoFinal.fecha).toLocaleDateString("es-CL")}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5 }}>
                <span>{t("caja.receiptTime")}</span>
                <span>{new Date(pedidoFinal.fecha).toLocaleTimeString("es-CL")}</span>
              </div>

              <hr className="stitch-divider" style={{ margin: "10px 0" }} />

              <p style={{ fontWeight: 700, fontSize: 11.5, textTransform: "uppercase", letterSpacing: "0.03em", color: "var(--muted)", margin: "0 0 8px" }}>
                {t("caja.receiptItemsHeader")}
              </p>
              {pedidoFinal.items.map((it, i) => (
                <div key={i} style={{ marginBottom: 8 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13.5, fontWeight: 600 }}>
                    <span>{it.nombre}{it.talla && it.talla !== "N/A" ? ` (${it.talla})` : ""}</span>
                    <span>{formatPrice(it.precio * it.cantidad)}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11.5, color: "var(--muted)" }}>
                    <span>{it.colegio || ""}</span>
                    <span>{it.cantidad} × {formatPrice(it.precio)}</span>
                  </div>
                </div>
              ))}

              <hr className="stitch-divider" style={{ margin: "10px 0" }} />

              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 4 }}>
                <span>{t("caja.receiptNet")}</span>
                <span>{formatPrice(montoNeto)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 8 }}>
                <span>{t("caja.receiptIva")}</span>
                <span>{formatPrice(montoIva)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 17 }}>
                <span>{t("caja.receiptTotal")}</span>
                <span>{formatPrice(pedidoFinal.total)}</span>
              </div>

              <hr className="stitch-divider" style={{ margin: "10px 0" }} />

              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                <span>{t("caja.receiptMethod")}</span>
                <strong>{metodoLabel(pedidoFinal.metodoPago)}</strong>
              </div>
              {pedidoFinal.metodoPago === "efectivo" && (
                <>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginTop: 4 }}>
                    <span>{t("caja.cashReceivedLabel")}</span>
                    <span>{formatPrice(pedidoFinal.montoRecibido)}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginTop: 4 }}>
                    <span>{t("caja.receiptChange")}</span>
                    <span>{formatPrice(Math.max(pedidoFinal.vuelto, 0))}</span>
                  </div>
                </>
              )}

              <p style={{ textAlign: "center", fontSize: 12.5, fontWeight: 600, marginTop: 18, marginBottom: 2 }}>
                {t("caja.receiptThanks")}
              </p>
              <p style={{ textAlign: "center", fontSize: 11, color: "var(--muted)" }}>{t("caja.receiptKeep")}</p>
            </div>

            <div className="no-print" style={{ display: "flex", gap: 10, marginTop: 16 }}>
              <button className="btn btn-outline" onClick={() => window.print()}>
                {t("caja.printButton")}
              </button>
              <button className="btn btn-primary" onClick={nuevaVenta}>
                {t("caja.newSaleButton")}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
