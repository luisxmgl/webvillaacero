import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { ref, onValue, update } from "firebase/database"
import { db } from "../firebase.js"
import { formatPrice } from "../utils.js"
import { useLanguage } from "../context/LanguageContext.jsx"

export default function AdminOrders() {
  const navigate = useNavigate()
  const { t } = useLanguage()
  const [pedidos, setPedidos] = useState([])

  const ESTADO_LABEL = {
    1: t("adminOrders.estado1"),
    2: t("adminOrders.estado2"),
    3: t("adminOrders.estado3"),
    4: t("adminOrders.estado4"),
  }

  useEffect(() => {
    const pedidosRef = ref(db, "pedidos")
    const unsubscribe = onValue(pedidosRef, (snap) => {
      const data = snap.val() || {}
      const lista = Object.values(data).sort((a, b) => (b.fecha || 0) - (a.fecha || 0))
      setPedidos(lista)
    })
    return () => unsubscribe()
  }, [])

  function cambiarEstado(codigo, estado) {
    update(ref(db, `pedidos/${codigo}`), { estado: Number(estado) })
  }

  return (
    <div className="screen">
      <div className="topbar">
        <button className="back" onClick={() => navigate("/colegios")} aria-label="Volver">
          ←
        </button>
        <h1 style={{ flex: 1 }}>{t("adminOrders.title")}</h1>
        <button
          className="btn btn-ghost"
          onClick={() => {
            localStorage.removeItem("va_isAdmin")
            localStorage.removeItem("va_admin_remembered")
            navigate("/admin/login")
          }}
          style={{ marginLeft: 8 }}
        >
          {t("adminOrders.logout")}
        </button>
      </div>

      <div className="content">
        {pedidos.length === 0 && (
          <div className="empty-state">
            <div className="glyph">VA</div>
            {t("adminOrders.empty")}
          </div>
        )}

        {pedidos.map((p) => (
          <div key={p.codigoRetiro} className="stitch-card" style={{ marginBottom: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <strong>#{p.codigoRetiro}</strong>
              <span style={{ fontFamily: "var(--font-display)", color: "var(--thread)" }}>
                {formatPrice((p.total || 0) + (p.extraCharge || 0))}
              </span>
            </div>
            <ul style={{ fontSize: 13, color: "var(--muted)", margin: "8px 0", paddingLeft: 18 }}>
              {(p.items || []).map((it, i) => (
                <li key={i}>
                  {it.nombre} × {it.cantidad}
                </li>
              ))}
            </ul>
            {p.customization && <p style={{ fontSize: 12.5, color: "var(--muted)" }}>{t("adminOrders.adjustmentsLabel")}: {p.customization}</p>}
            <select value={p.estado} onChange={(e) => cambiarEstado(p.codigoRetiro, e.target.value)} style={{ marginTop: 8 }}>
              {Object.entries(ESTADO_LABEL).map(([n, label]) => (
                <option key={n} value={n}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>
    </div>
  )
}
