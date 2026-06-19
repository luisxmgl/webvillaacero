import { useEffect, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { ref, get } from "firebase/database"
import { db } from "../firebase.js"

const ESTADOS = [
  { n: 1, label: "Recibido" },
  { n: 2, label: "En confección" },
  { n: 3, label: "Listo" },
]

const NOTAS = {
  1: "Hemos recibido tu pago. Tu pedido está en espera de entrar al taller.",
  2: "¡Buenas noticias! Tu pedido está siendo confeccionado o bordado en este momento.",
  3: "¡Tu pedido está LISTO! Puedes pasar a la tienda a retirarlo con la cajera.",
}

export default function Tracking() {
  const location = useLocation()
  const navigate = useNavigate()
  const [code, setCode] = useState(location.state?.code || "")
  const [pedido, setPedido] = useState(null)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function buscar(c) {
    const target = c ?? code
    if (!target.trim()) return
    setError("")
    setPedido(null)
    setLoading(true)
    try {
      const snap = await get(ref(db, `pedidos/${target.trim()}`))
      if (snap.exists()) {
        setPedido(snap.val())
      } else {
        setError(`No se encontró el pedido #${target}`)
      }
    } catch (e) {
      setError("Error de conexión con el servidor")
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
        <h1 style={{ flex: 1 }}>Seguimiento</h1>
      </div>

      <div className="content">
        <div style={{ display: "flex", gap: 8 }}>
          <input placeholder="Código de retiro" value={code} onChange={(e) => setCode(e.target.value)} />
          <button className="btn btn-primary" style={{ width: "auto", padding: "11px 18px" }} onClick={() => buscar()}>
            Buscar
          </button>
        </div>

        {loading && <p style={{ color: "var(--muted)", marginTop: 16 }}>Buscando...</p>}
        {error && <p style={{ color: "var(--thread)", marginTop: 16 }}>{error}</p>}

        {pedido && (
          <div className="stitch-card" style={{ marginTop: 20 }}>
            <h3 style={{ fontFamily: "var(--font-display)", margin: "0 0 4px" }}>Pedido #{pedido.codigoRetiro}</h3>

            <div className="status-track">
              {ESTADOS.map((e) => (
                <div key={e.n} className={`status-step ${pedido.estado >= e.n ? "done" : ""}`}>
                  <div className="dot">{pedido.estado >= e.n ? "✓" : e.n}</div>
                  <div className="step-label">{e.label}</div>
                </div>
              ))}
            </div>

            <p style={{ fontSize: 13.5, color: "var(--muted)" }}>
              {NOTAS[pedido.estado] || "Consulta en tienda por el estado de tu pedido."}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
