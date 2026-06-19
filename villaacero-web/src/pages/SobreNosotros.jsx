import { useNavigate } from "react-router-dom"
import { openWhatsApp } from "../utils.js"

export default function SobreNosotros() {
  const navigate = useNavigate()

  return (
    <div className="screen">
      <div className="topbar">
        <button className="back" onClick={() => navigate(-1)} aria-label="Volver">
          ←
        </button>
        <h1 style={{ flex: 1 }}>Sobre nosotros</h1>
      </div>

      <div className="content">
        <div className="product-card" style={{ cursor: "default", height: 180, marginBottom: 18 }}>
          <div className="swatch" style={{ height: "100%", fontSize: 28 }}>
            Confecciones Villa Acero
          </div>
        </div>

        <p style={{ color: "var(--muted)", fontSize: 14.5, lineHeight: 1.6 }}>
          Hace más de una década confeccionamos uniformes escolares a medida para colegios de Hualpén,
          Concepción, Talcahuano y Chiguayante, con telas resistentes y atención personalizada en cada pedido.
        </p>

        <hr className="stitch-divider" />

        <button className="btn btn-secondary" onClick={() => openWhatsApp("Hola! Quería consultar sobre los uniformes.")}>
          Escribir por WhatsApp
        </button>
        <button
          className="btn btn-outline"
          style={{ marginTop: 10 }}
          onClick={() => window.open("https://www.instagram.com/confecciones.villaacero/", "_blank")}
        >
          Ver Instagram
        </button>
        <button
          className="btn btn-outline"
          style={{ marginTop: 10 }}
          onClick={() =>
            window.open("https://www.google.com/maps/search/?api=1&query=Confecciones+Villa+Acero+Hualp%C3%A9n", "_blank")
          }
        >
          Cómo llegar
        </button>
      </div>
    </div>
  )
}
