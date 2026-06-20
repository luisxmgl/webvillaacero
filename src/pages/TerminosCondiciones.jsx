import { useNavigate } from "react-router-dom"
import { useLanguage } from "../context/LanguageContext.jsx"

const SECTIONS = [1, 2, 3, 4, 5, 6, 7, 8]

export default function TerminosCondiciones() {
  const navigate = useNavigate()
  const { t } = useLanguage()

  return (
    <div className="screen">
      <div className="topbar">
        <button className="back" onClick={() => navigate(-1)} aria-label="Volver">
          ←
        </button>
        <h1 style={{ flex: 1 }}>{t("terms.title")}</h1>
      </div>

      <div className="content">
        <p style={{ fontSize: 12.5, color: "var(--muted)", marginBottom: 18 }}>{t("terms.lastUpdated")}</p>

        {SECTIONS.map((n) => (
          <div key={n} style={{ marginBottom: 18 }}>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: 16, marginBottom: 6 }}>
              {t(`terms.section${n}Title`)}
            </h2>
            <p style={{ fontSize: 14, color: "var(--muted)", lineHeight: 1.6 }}>{t(`terms.section${n}Body`)}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
