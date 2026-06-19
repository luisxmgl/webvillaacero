import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

export default function AdminLogin() {
  const navigate = useNavigate()
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
      setError("Credenciales incorrectas")
    }
  }

  return (
    <div className="screen" style={{ justifyContent: "center" }}>
      <div className="content" style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: 24, color: "var(--ink)", marginBottom: 20 }}>
          Acceso administrador
        </h1>

        <input placeholder="Usuario" value={user} onChange={(e) => setUser(e.target.value)} style={{ marginBottom: 10 }} />
        <input
          placeholder="Contraseña"
          type="password"
          value={pass}
          onChange={(e) => setPass(e.target.value)}
          style={{ marginBottom: 10 }}
        />

        <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13.5, color: "var(--muted)", marginBottom: 16 }}>
          <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} style={{ width: "auto" }} />
          Recordar sesión en este equipo
        </label>

        {error && <p style={{ color: "var(--thread)", fontSize: 13.5, marginBottom: 12 }}>{error}</p>}

        <button className="btn btn-primary" onClick={handleLogin}>
          Iniciar sesión
        </button>
        <button className="btn btn-ghost" style={{ marginTop: 14 }} onClick={() => navigate("/")}>
          Volver
        </button>
      </div>
    </div>
  )
}
