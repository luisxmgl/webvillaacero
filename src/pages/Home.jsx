import { useNavigate } from "react-router-dom"
import { useLanguage } from "../context/LanguageContext.jsx"

export default function Home() {
  const navigate = useNavigate()
  const { t } = useLanguage()

  function entrarComoInvitado() {
    localStorage.setItem("va_isAdmin", "0")
    navigate("/colegios")
  }

  return (
    <div className="screen" style={{ justifyContent: "center", alignItems: "center", textAlign: "center" }}>
      <div className="content" style={{ display: "flex", flexDirection: "column", justifyContent: "center", flex: 1 }}>
        <p className="label-tag" style={{ alignSelf: "center", marginBottom: 18 }}>
          {t("home.tag")}
        </p>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: 34, margin: "0 0 8px", color: "var(--ink)" }}>
          {t("home.titleLine1")}
          <br />
          {t("home.titleLine2")}
        </h1>
        <p style={{ color: "var(--muted)", fontSize: 15, margin: "0 0 40px" }}>
          {t("home.subtitle")}
        </p>
        <button className="btn btn-primary" onClick={entrarComoInvitado}>
          {t("home.guestButton")}
        </button>
        <button
          className="btn btn-ghost"
          style={{ marginTop: 18 }}
          onClick={() => navigate("/admin/login")}
        >
          {t("home.adminButton")}
        </button>
      </div>
    </div>
  )
}
