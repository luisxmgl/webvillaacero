import { useNavigate } from "react-router-dom"

export default function Home() {
  const navigate = useNavigate()

  function entrarComoInvitado() {
    localStorage.setItem("va_isAdmin", "0")
    navigate("/colegios")
  }

  return (
    <div className="screen" style={{ justifyContent: "center", alignItems: "center", textAlign: "center" }}>
      <div className="content" style={{ display: "flex", flexDirection: "column", justifyContent: "center", flex: 1 }}>
        <p className="label-tag" style={{ alignSelf: "center", marginBottom: 18 }}>
          UNIFORMES ESCOLARES
        </p>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: 34, margin: "0 0 8px", color: "var(--ink)" }}>
          Confecciones
          <br />
          Villa Acero
        </h1>
        <p style={{ color: "var(--muted)", fontSize: 15, margin: "0 0 40px" }}>
          Uniformes a medida para colegios de Hualpén, Concepción, Talcahuano y Chiguayante.
        </p>
        <button className="btn btn-primary" onClick={entrarComoInvitado}>
          Entrar como invitado
        </button>
        <button
          className="btn btn-ghost"
          style={{ marginTop: 18 }}
          onClick={() => navigate("/admin/login")}
        >
          Acceso administrador
        </button>
      </div>
    </div>
  )
}
