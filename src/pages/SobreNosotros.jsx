import { useNavigate } from "react-router-dom"
import { openWhatsApp } from "../utils.js"
import { useLanguage } from "../context/LanguageContext.jsx"

export default function SobreNosotros() {
  const navigate = useNavigate()
  const { t } = useLanguage()

  return (
    <div className="screen">
      <div className="topbar">
        <button className="back" onClick={() => navigate(-1)} aria-label="Volver">
          ←
        </button>
        <h1 style={{ flex: 1 }}>{t("sobreNosotros.title")}</h1>
      </div>

      <div className="content">
        <div className="product-card" style={{ cursor: "default", height: 180, marginBottom: 18 }}>
          <div className="swatch" style={{ height: "100%", fontSize: 28, gap: 14 }}>
            <img
              src="/logopagina.jpg"
              alt="Logo Villa Acero"
              style={{ width: 64, height: 64, objectFit: "contain", borderRadius: 12, background: "rgba(0,0,0,0.92)" }}
            />
            {t("sobreNosotros.cardTitle")}
          </div>
        </div>

        <p style={{ color: "var(--muted)", fontSize: 14.5, lineHeight: 1.6 }}>
          {t("sobreNosotros.paragraph1")}
        </p>

        <p style={{ color: "var(--muted)", fontSize: 14.5, lineHeight: 1.6, marginTop: 12 }}>
          {t("sobreNosotros.paragraph2")}
        </p>

        <hr className="stitch-divider" />

        {/* Botón de WhatsApp eliminado por petición del usuario */}
        <button
          className="btn btn-outline"
          style={{ marginTop: 10, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
          onClick={() =>
            window.open("https://www.google.com/maps/search/?api=1&query=Confecciones+Villa+Acero+Hualp%C3%A9n", "_blank")
          }
        >
          <img src="/gpsicono.png" alt="" width={20} height={20} />
          {t("sobreNosotros.howToGet")}
        </button>
      </div>
    </div>
  )
}
