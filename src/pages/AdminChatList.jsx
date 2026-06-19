import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { ref, onValue } from "firebase/database"
import { db } from "../firebase.js"
import { useLanguage } from "../context/LanguageContext.jsx"
import { subscribeQueue, resolveQueueItem, addCustomRule } from "../chatbot/queue.js"

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

function QueueItem({ item, t }) {
  const [answer, setAnswer] = useState("")
  const [keywords, setKeywords] = useState("")

  function teach() {
    const trimmedAnswer = answer.trim()
    const keywordList = keywords.split(",").map((k) => k.trim()).filter(Boolean)
    if (!trimmedAnswer || keywordList.length === 0) return
    addCustomRule({ keywords: keywordList, answer: trimmedAnswer })
    resolveQueueItem(item.id)
  }

  return (
    <div className="stitch-card" style={{ marginBottom: 12 }}>
      <div className="subtitle" style={{ marginBottom: 4 }}>{t("chatbotQueue.fromChat", { name: item.chatId })}</div>
      <p style={{ fontWeight: 600, marginBottom: 10 }}>{item.text}</p>
      <textarea
        placeholder={t("chatbotQueue.answerPlaceholder")}
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        rows={3}
        style={{ marginBottom: 8, resize: "vertical" }}
      />
      <input
        placeholder={t("chatbotQueue.keywordsPlaceholder")}
        value={keywords}
        onChange={(e) => setKeywords(e.target.value)}
        style={{ marginBottom: 10 }}
      />
      <div style={{ display: "flex", gap: 8 }}>
        <button className="btn btn-primary" style={{ width: "auto", padding: "9px 16px" }} onClick={teach}>
          {t("chatbotQueue.teachButton")}
        </button>
        <button className="btn btn-ghost" onClick={() => resolveQueueItem(item.id)}>
          {t("chatbotQueue.dismiss")}
        </button>
      </div>
    </div>
  )
}

export default function AdminChatList() {
  const navigate = useNavigate()
  const { t } = useLanguage()
  const [tab, setTab] = useState("chats")
  const [conversaciones, setConversaciones] = useState([])
  const [presenceMap, setPresenceMap] = useState({})
  const [openedChats, setOpenedChats] = useState(loadOpenedChats())
  const [queue, setQueue] = useState([])

  useEffect(() => subscribeQueue(setQueue), [])

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

      buildFromLocal()
      const onStorage = (e) => {
        if (!e.key) return
        if (e.key.startsWith("mock_chat_")) buildFromLocal()
      }
      window.addEventListener("storage", onStorage)
      return () => window.removeEventListener("storage", onStorage)
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
            navigate("/admin/login")
          }}
          style={{ marginLeft: 8 }}
        >
          {t("adminChatList.logout")}
        </button>
      </div>

      <div className="content">
        <div className="chip-row" style={{ marginBottom: 18 }}>
          <button className={`chip ${tab === "chats" ? "active" : ""}`} onClick={() => setTab("chats")}>
            {t("adminChatList.learningTab")}
          </button>
          <button className={`chip ${tab === "queue" ? "active" : ""}`} onClick={() => setTab("queue")}>
            {t("adminChatList.queueTab")} {queue.length > 0 ? `(${queue.length})` : ""}
          </button>
        </div>

        {tab === "chats" && (
          <>
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
          </>
        )}

        {tab === "queue" && (
          <>
            <p style={{ color: "var(--muted)", fontSize: 13.5, marginBottom: 16 }}>{t("chatbotQueue.description")}</p>
            {queue.length === 0 && (
              <div className="empty-state">
                <div className="glyph">VA</div>
                {t("chatbotQueue.empty")}
              </div>
            )}
            {queue.map((item) => (
              <QueueItem key={item.id} item={item} t={t} />
            ))}
          </>
        )}
      </div>
    </div>
  )
}
