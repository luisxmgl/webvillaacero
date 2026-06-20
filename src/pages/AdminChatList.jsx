import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { ref, onValue } from "firebase/database"
import { db } from "../firebase.js"
import { useLanguage } from "../context/LanguageContext.jsx"

function tiempoRelativo(timestamp, t) {
  if (!timestamp) return ""
  const diffMs = Date.now() - timestamp
  const minutos = Math.floor(diffMs / 60000)
  if (minutos < 1) return t("adminChatList.justNow")
  if (minutos < 60) return t("adminChatList.minutesAgo", { n: minutos })
  const horas = Math.floor(minutos / 60)
  if (horas < 24) return t("adminChatList.hoursAgo", { n: horas })
  const dias = Math.floor(horas / 24)
  return t("adminChatList.daysAgo", { n: dias })
}

function formatLastSeen(timestamp, t) {
  if (!timestamp) return t("adminChatList.noRecord")
  const date = new Date(timestamp)
  return date.toLocaleString("es-CL", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
  })
}

function loadOpenedChats() {
  const opened = {}
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (!key || !key.startsWith("opened_chat_")) continue
    const raw = localStorage.getItem(key)
    opened[key.replace("opened_chat_", "")] = raw === "1" ? Infinity : Number(raw) || 0
  }
  return opened
}

export default function AdminChatList() {
  const navigate = useNavigate()
  const { t } = useLanguage()
  const [conversaciones, setConversaciones] = useState([])
  const [presenceMap, setPresenceMap] = useState({})
  const [openedChats, setOpenedChats] = useState(loadOpenedChats())

  useEffect(() => {
    let unsubChats = null
    let unsubPresence = null

    const buildConversations = (data) => {
      const lista = Object.entries(data).map(([chatId, mensajesObj]) => {
        const mensajes = Object.values(mensajesObj || {}).sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0))
        const ultimo = mensajes[mensajes.length - 1]
        return {
          chatId,
          ultimoTexto: ultimo?.imageUrl ? "📷 Imagen" : ultimo?.text || "",
          ultimoTimestamp: ultimo?.timestamp || 0,
          esDelCliente: ultimo?.senderId !== "admin" && ultimo?.senderId !== "bot",
        }
      })
      lista.sort((a, b) => b.ultimoTimestamp - a.ultimoTimestamp)
      setConversaciones(lista)
    }

    if (db) {
      const chatsRef = ref(db, "chats")
      unsubChats = onValue(chatsRef, (snap) => {
        buildConversations(snap.val() || {})
      })

      const presRef = ref(db, "presence")
      unsubPresence = onValue(presRef, (snap) => {
        setPresenceMap(snap.val() || {})
      })
    } else {
      const buildFromLocal = () => {
        const lista = []
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i)
          if (!key || !key.startsWith("mock_chat_")) continue
          const chatId = key.replace("mock_chat_", "")
          try {
            const mensajes = JSON.parse(localStorage.getItem(key) || "[]").sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0))
            const ultimo = mensajes[mensajes.length - 1]
            lista.push({
              chatId,
              ultimoTexto: ultimo?.imageUrl ? "📷 Imagen" : ultimo?.text || "",
              ultimoTimestamp: ultimo?.timestamp || 0,
              esDelCliente: ultimo?.senderId !== "admin" && ultimo?.senderId !== "bot",
            })
          } catch (e) {
            // ignore malformed
          }
        }
        lista.sort((a, b) => b.ultimoTimestamp - a.ultimoTimestamp)
        setConversaciones(lista)
      }

      const buildPresenceFromLocal = () => {
        const map = {}
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i)
          if (!key || !key.startsWith("presence_")) continue
          try {
            map[key.replace("presence_", "")] = JSON.parse(localStorage.getItem(key) || "{}")
          } catch (e) {
            // ignore malformed
          }
        }
        setPresenceMap(map)
      }

      buildFromLocal()
      buildPresenceFromLocal()
      const onStorage = (e) => {
        if (!e.key) return
        if (e.key.startsWith("mock_chat_")) buildFromLocal()
        if (e.key.startsWith("presence_")) buildPresenceFromLocal()
      }
      window.addEventListener("storage", onStorage)
      window.addEventListener("va-local-chat-updated", buildFromLocal)
      return () => {
        window.removeEventListener("storage", onStorage)
        window.removeEventListener("va-local-chat-updated", buildFromLocal)
      }
    }

    return () => {
      if (typeof unsubChats === "function") unsubChats()
      if (typeof unsubPresence === "function") unsubPresence()
    }
  }, [])

  return (
    <div className="screen">
      <div className="topbar">
        <button className="back" onClick={() => navigate("/colegios")} aria-label="Volver">
          ←
        </button>
        <h1 style={{ flex: 1 }}>{t("adminChatList.title")}</h1>
        <button
          className="btn btn-ghost"
          onClick={() => {
            localStorage.removeItem("va_isAdmin")
            localStorage.removeItem("va_admin_remembered")
            navigate("/")
          }}
          style={{ marginLeft: 8 }}
        >
          {t("adminChatList.logout")}
        </button>
      </div>

      <div className="content">
        {conversaciones.length === 0 && (
          <div className="empty-state">
            <div className="glyph">VA</div>
            {t("adminChatList.empty")}
          </div>
        )}

        {conversaciones.map((c) => {
          const isNew = c.esDelCliente && c.ultimoTimestamp > (openedChats[c.chatId] ?? 0)
          const isOnline = presenceMap[c.chatId]?.online || false
          const lastSeen = presenceMap[c.chatId]?.lastSeen
          return (
            <div
              key={c.chatId}
              className={`school-row ${isNew ? "pending" : "opened"}`}
              onClick={() => {
                const now = Date.now()
                localStorage.setItem(`opened_chat_${c.chatId}`, String(now))
                setOpenedChats((prev) => ({ ...prev, [c.chatId]: now }))
                navigate(`/admin/chat/${c.chatId}`)
              }}
            >
              <div className={`initial ${isNew ? "pending" : "opened"}`} style={{ position: "relative" }}>
                {c.chatId.charAt(0).toUpperCase()}
                {isOnline && <span className="presence-dot" />}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="name">{c.chatId}</div>
                <div className="subtitle">
                  {c.esDelCliente ? t("adminChatList.clientPrefix") : t("adminChatList.youPrefix")} {c.ultimoTexto || t("adminChatList.noMessage")}
                </div>
                <div className="last-seen">
                  {isOnline ? t("adminChatList.activeNow") : t("adminChatList.lastSeen", { time: formatLastSeen(lastSeen, t) })}
                </div>
              </div>
              <div className="right-side">
                <div className="meta-time">{tiempoRelativo(c.ultimoTimestamp, t)}</div>
                <span className={`chat-badge ${isNew ? "new" : "opened"}`}>{isNew ? t("adminChatList.statusNew") : t("adminChatList.statusOpened")}</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
