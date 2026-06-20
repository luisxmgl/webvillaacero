import { useSearchParams, useNavigate } from "react-router-dom"
import { useLanguage } from "../context/LanguageContext.jsx"
import ConfirmationModal from "../components/ConfirmationModal.jsx"

export default function PagoResultado() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { t } = useLanguage()

  const orderCode = searchParams.get("orderCode") || ""
  const estado = searchParams.get("estado") || "error"

  if (estado === "ok" && orderCode) {
    return <ConfirmationModal orderCode={orderCode} onClose={() => navigate("/colegios")} />
  }

  const messageKey =
    estado === "rechazado" ? "pagoResultado.rejected" : estado === "anulado" ? "pagoResultado.cancelled" : "pagoResultado.error"

  return (
    <div className="screen" style={{ justifyContent: "center" }}>
      <div className="content" style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", textAlign: "center" }}>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: 22, color: "var(--ink)", marginBottom: 14 }}>
          {t("pagoResultado.title")}
        </h1>
        <p style={{ fontSize: 14.5, color: "var(--muted)", marginBottom: 20 }}>{t(messageKey)}</p>
        <button className="btn btn-primary" onClick={() => navigate("/colegios")}>
          {t("pagoResultado.backToStore")}
        </button>
      </div>
    </div>
  )
}
