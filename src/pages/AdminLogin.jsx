import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useLanguage } from "../context/LanguageContext.jsx"

export default function AdminLogin() {
  const navigate = useNavigate()
  const { t } = useLanguage()
  const [user, setUser] = useState("")
  const [pass, setPass] = useState("")
  const [remember, setRemember] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (localStorage.getItem("va_admin_remembered") === "1") {
      entrar()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function entrar() {
    localStorage.setItem("va_isAdmin", "1")
    navigate("/colegios")
  }

  function handleLogin() {
    if (user === "administrador" && pass === "2026") {
      if (remember) localStorage.setItem("va_admin_remembered", "1")
      entrar()
    } else {
      setError(t("adminLogin.invalidCredentials"))
    }
  }

  return (
    <div className="screen" style={{ justifyContent: "center" }}>
      <div className="content" style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: 24, color: "var(--ink)", marginBottom: 20 }}>
          {t("adminLogin.title")}
        </h1>

        <input placeholder={t("adminLogin.userPlaceholder")} value={user} onChange={(e) => setUser(e.target.value)} style={{ marginBottom: 10 }} />
        <input
          placeholder={t("adminLogin.passPlaceholder")}
          type="password"
          value={pass}
          onChange={(e) => setPass(e.target.value)}
          style={{ marginBottom: 10 }}
        />

        <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13.5, color: "var(--muted)", marginBottom: 16 }}>
          <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} style={{ width: "auto" }} />
          {t("adminLogin.remember")}
        </label>

        {error && <p style={{ color: "var(--thread)", fontSize: 13.5, marginBottom: 12 }}>{error}</p>}

        <button className="btn btn-primary" onClick={handleLogin}>
          {t("adminLogin.login")}
        </button>
        <button className="btn btn-ghost" style={{ marginTop: 14 }} onClick={() => navigate("/")}>
          {t("adminLogin.back")}
        </button>
      </div>
    </div>
  )
}
