import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useLanguage } from "../context/LanguageContext.jsx"
import { openWhatsApp } from "../utils.js"

export default function Contacto() {
  const navigate = useNavigate()
  const { t } = useLanguage()
  const [nombre, setNombre] = useState("")
  const [email, setEmail] = useState("")
  const [telefono, setTelefono] = useState("")
  const [mensaje, setMensaje] = useState("")
  const [error, setError] = useState("")
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)

  async function enviar() {
    if (!nombre.trim() || !email.trim() || !mensaje.trim()) {
      setError(t("contacto.requiredError"))
      return
    }
    setError("")
    setSending(true)

    try {
      const res = await fetch("/api/contacto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: nombre.trim(),
          email: email.trim(),
          telefono: telefono.trim(),
          mensaje: mensaje.trim(),
        }),
      })
      if (!res.ok) throw new Error("send_failed")
      setSent(true)
      setNombre("")
      setEmail("")
      setTelefono("")
      setMensaje("")
    } catch {
      setError(t("contacto.sendError"))
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="screen">
      <div className="topbar">
        <button className="back" onClick={() => navigate(-1)} aria-label="Volver">
          ←
        </button>
        <h1 style={{ flex: 1 }}>{t("contacto.title")}</h1>
      </div>

      <div className="content">
        <p style={{ fontSize: 14.5, color: "var(--muted)", lineHeight: 1.6, marginBottom: 20 }}>
          {t("contacto.intro")}
        </p>

        <label style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, display: "block" }}>
          {t("contacto.nameLabel")}
        </label>
        <input
          placeholder={t("contacto.namePlaceholder")}
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          style={{ marginBottom: 14 }}
        />

        <label style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, display: "block" }}>
          {t("contacto.emailLabel")}
        </label>
        <input
          type="email"
          placeholder={t("contacto.emailPlaceholder")}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ marginBottom: 14 }}
        />

        <label style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, display: "block" }}>
          {t("contacto.phoneLabel")}
        </label>
        <input
          type="tel"
          placeholder={t("contacto.phonePlaceholder")}
          value={telefono}
          onChange={(e) => setTelefono(e.target.value)}
          style={{ marginBottom: 14 }}
        />

        <label style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, display: "block" }}>
          {t("contacto.messageLabel")}
        </label>
        <textarea
          placeholder={t("contacto.messagePlaceholder")}
          value={mensaje}
          onChange={(e) => setMensaje(e.target.value)}
          rows={5}
          style={{ marginBottom: 8, resize: "vertical" }}
        />

        {error && <p style={{ fontSize: 12.5, color: "var(--thread)", marginBottom: 10 }}>{error}</p>}

        <button className="btn btn-primary" onClick={enviar} disabled={sending}>
          {sending ? t("contacto.sendingButton") : t("contacto.submitButton")}
        </button>
        <p style={{ fontSize: 12, color: "var(--muted)", marginTop: 8, textAlign: "center" }}>
          {sent ? t("contacto.sentNote") : t("contacto.submitNote")}
        </p>

        <hr className="stitch-divider" />

        <div className="stitch-card">
          <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14, marginBottom: 8 }}>
            {t("contacto.storeInfoTitle")}
          </p>
          <p style={{ fontSize: 13.5, color: "var(--muted)", marginBottom: 4 }}>{t("footer.scheduleHours")}</p>
          <p style={{ fontSize: 13.5, color: "var(--muted)", marginBottom: 4 }}>{t("footer.address")}</p>
          <a href="tel:+56978450427" style={{ fontSize: 13.5, color: "var(--thread)", fontWeight: 600 }}>
            +56 9 7845 0427
          </a>
        </div>

        <button
          className="btn btn-outline"
          style={{ marginTop: 14, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
          onClick={() => openWhatsApp()}
        >
          {t("contacto.whatsappButton")}
        </button>
      </div>
    </div>
  )
}
