import { useEffect, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { ref, get } from "firebase/database"
import { db } from "../firebase.js"
import { useLanguage } from "../context/LanguageContext.jsx"

export default function Tracking() {
  const location = useLocation()
  const navigate = useNavigate()
  const { t } = useLanguage()
  const [code, setCode] = useState(location.state?.code || "")
  const [pedido, setPedido] = useState(null)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const ESTADOS = [
    { n: 1, label: t("tracking.estado1") },
    { n: 2, label: t("tracking.estado2") },
    { n: 3, label: t("tracking.estado3") },
  ]

  const NOTAS = {
    1: t("tracking.nota1"),
    2: t("tracking.nota2"),
    3: t("tracking.nota3"),
  }

  async function buscar(c) {
    const raw = c ?? code
    if (!raw.trim()) return
    // Los códigos generados ahora incluyen letras (ver generateOrderCode en utils.js);
    // se normaliza a mayúsculas para que la búsqueda no falle por cómo lo tipeó el cliente.
    const target = raw.trim().toUpperCase()
    setError("")
    setPedido(null)
    setLoading(true)
    try {
      const snap = await get(ref(db, `pedidos/${target}`))
      if (snap.exists()) {
        setPedido(snap.val())
      } else {
        setError(t("tracking.notFound", { code: target }))
      }
    } catch (e) {
      setError(t("tracking.connectionError"))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (location.state?.code) buscar(location.state.code)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="screen">
      <div className="topbar">
        <button className="back" onClick={() => navigate(-1)} aria-label="Volver">
          ←
        </button>
        <h1 style={{ flex: 1 }}>{t("tracking.title")}</h1>
      </div>

      <div className="content">
        <div style={{ display: "flex", gap: 8 }}>
          <input placeholder={t("tracking.placeholder")} value={code} onChange={(e) => setCode(e.target.value)} />
          <button className="btn btn-primary" style={{ width: "auto", padding: "11px 18px" }} onClick={() => buscar()}>
            {t("tracking.search")}
          </button>
        </div>

        {loading && <p style={{ color: "var(--muted)", marginTop: 16 }}>{t("tracking.searching")}</p>}
        {error && <p style={{ color: "var(--thread)", marginTop: 16 }}>{error}</p>}

        {pedido && (
          <div className="stitch-card" style={{ marginTop: 20 }}>
            <h3 style={{ fontFamily: "var(--font-display)", margin: "0 0 4px" }}>{t("tracking.orderLabel", { code: pedido.codigoRetiro })}</h3>

            <div className="status-track">
              {ESTADOS.map((e) => (
                <div key={e.n} className={`status-step ${pedido.estado >= e.n ? "done" : ""}`}>
                  <div className="dot">{pedido.estado >= e.n ? "✓" : e.n}</div>
                  <div className="step-label">{e.label}</div>
                </div>
              ))}
            </div>

            <p style={{ fontSize: 13.5, color: "var(--muted)" }}>
              {NOTAS[pedido.estado] || t("tracking.notaDefault")}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
