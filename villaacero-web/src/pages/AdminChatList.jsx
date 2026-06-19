import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { ref, onValue } from "firebase/database"
import { db } from "../firebase.js"

function tiempoRelativo(timestamp) {
  if (!timestamp) return ""
  const diffMs = Date.now() - timestamp
  const minutos = Math.floor(diffMs / 60000)
  if (minutos < 1) return "ahora"
  if (minutos < 60) return `hace ${minutos} min`
  const horas = Math.floor(minutos / 60)
  if (horas < 24) return `hace ${horas} h`
  const dias = Math.floor(horas / 24)
  return `hace ${dias} d`
}

export default function AdminChatList() {
  const navigate = useNavigate()
  const [conversaciones, setConversaciones] = useState([])

  useEffect(() => {
    const chatsRef = ref(db, "chats")
    const unsubscribe = onValue(chatsRef, (snap) => {
      const data = snap.val() || {}
      const lista = Object.entries(data).map(([chatId, mensajesObj]) => {
        const mensajes = Object.values(mensajesObj || {}).sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0))
        const ultimo = mensajes[mensajes.length - 1]
        return {
          chatId,
          ultimoTexto: ultimo?.imageUrl ? "📷 Imagen" : ultimo?.text || "",
          ultimoTimestamp: ultimo?.timestamp || 0,
          esDelCliente: ultimo?.senderId !== "admin",
        }
      })
      lista.sort((a, b) => b.ultimoTimestamp - a.ultimoTimestamp)
      setConversaciones(lista)
    })
    return () => unsubscribe()
  }, [])

  return (
    <div className="screen">
      <div className="topbar">
        <button className="back" onClick={() => navigate("/colegios")} aria-label="Volver">
          ←
        </button>
        <h1 style={{ flex: 1 }}>Mensajes recibidos</h1>
      </div>

      <div className="content">
        {conversaciones.length === 0 && (
          <div className="empty-state">
            <div className="glyph">VA</div>
            Todavía no hay conversaciones.
          </div>
        )}

        {conversaciones.map((c) => (
          <div key={c.chatId} className="school-row" onClick={() => navigate(`/admin/chat/${c.chatId}`)}>
            <div className="initial">{c.chatId.charAt(0).toUpperCase()}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="name">{c.chatId}</div>
              <div
                className="comuna"
                style={{
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  fontWeight: c.esDelCliente ? 600 : 400,
                  color: c.esDelCliente ? "var(--ink)" : "var(--muted)",
                }}
              >
                {c.esDelCliente ? "" : "Tú: "}
                {c.ultimoTexto}
              </div>
            </div>
            <div style={{ fontSize: 11.5, color: "var(--muted)", flexShrink: 0 }}>{tiempoRelativo(c.ultimoTimestamp)}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
