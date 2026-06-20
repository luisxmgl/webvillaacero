import { useEffect, useRef, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { ref, push, set, onValue, onDisconnect } from "firebase/database"
import { db } from "../firebase.js"
import { getGuestId } from "../utils.js"
import Icon from "../components/Icons.jsx"
import { useLanguage } from "../context/LanguageContext.jsx"

export default function Chat({ admin = false }) {
  const navigate = useNavigate()
  const { t } = useLanguage()
  const { chatId: targetId } = useParams()
  const currentUserId = admin ? "admin" : getGuestId()
  const chatId = admin ? targetId : currentUserId

  const [messages, setMessages] = useState([])
  const [text, setText] = useState("")
  const bottomRef = useRef(null)
  const fileInputRef = useRef(null)

  useEffect(() => {
    // El admin tiene su propia vista de chats (/admin/mensajes); si llega aquí
    // (por ejemplo escribiendo /chat directo en la URL) no debe usar la
    // identidad de invitado de este navegador, que es de otra persona.
    if (!admin && localStorage.getItem("va_isAdmin") === "1") {
      navigate("/admin/mensajes", { replace: true })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [admin])

  useEffect(() => {
    if (!chatId) return
    // Presence tracking for guest users
    let presenceInterval = null
    let clearPresence = null
    if (!admin) {
      if (db) {
        const presenceRef = ref(db, `presence/${currentUserId}`)
        set(presenceRef, { online: true, lastSeen: Date.now() })
        try {
          onDisconnect(presenceRef).set({ online: false, lastSeen: Date.now() })
        } catch {}
        // heartbeat
        presenceInterval = setInterval(() => {
          set(presenceRef, { online: true, lastSeen: Date.now() })
        }, 20000)
      } else {
        // fallback localStorage presence
        const pkey = `presence_${currentUserId}`
        const updatePresence = () => localStorage.setItem(pkey, JSON.stringify({ online: true, lastSeen: Date.now() }))
        updatePresence()
        presenceInterval = setInterval(updatePresence, 20000)
        clearPresence = () => localStorage.setItem(pkey, JSON.stringify({ online: false, lastSeen: Date.now() }))
        window.addEventListener("beforeunload", clearPresence)
      }
    }

    function markSeen() {
      if (admin) localStorage.setItem(`opened_chat_${chatId}`, String(Date.now()))
      else localStorage.setItem(`va_seen_chat_${currentUserId}`, String(Date.now()))
      window.dispatchEvent(new Event("va-local-chat-updated"))
    }

    // First scroll on a freshly opened chat should land instantly at the bottom
    // (no visible animated jump); later updates scroll smoothly.
    let isFirstScroll = true
    function scrollToBottom() {
      const behavior = isFirstScroll ? "auto" : "smooth"
      isFirstScroll = false
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior, block: "end" }), 50)
    }

    if (db) {
      try {
        const chatRef = ref(db, `chats/${chatId}`)
        const unsubscribe = onValue(chatRef, (snap) => {
          const data = snap.val() || {}
          const list = Object.values(data).sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0))
          setMessages(list)
          markSeen()
          if (list.length) scrollToBottom()
        })
        return () => {
          try {
            unsubscribe()
          } catch (e) {
            console.warn("Error unsubscribing chatRef:", e)
          }
          if (presenceInterval) clearInterval(presenceInterval)
          if (!admin && db) {
            const presenceRef = ref(db, `presence/${currentUserId}`)
            set(presenceRef, { online: false, lastSeen: Date.now() })
          }
        }
      } catch (e) {
        console.error("Error initializing chat subscription:", e)
      }
    }

    // Fallback: usar localStorage para desarrollo sin Firebase
    const key = `mock_chat_${chatId}`
    try {
      const stored = JSON.parse(localStorage.getItem(key) || "[]")
      setMessages(stored)
      markSeen()
      if (stored.length) scrollToBottom()
    } catch {
      setMessages([])
    }
    const onStorage = (e) => {
      if (e.key === key) {
        try {
          setMessages(JSON.parse(e.newValue || "[]"))
          markSeen()
        } catch {
          setMessages([])
        }
      }
    }
    window.addEventListener("storage", onStorage)
    return () => {
      window.removeEventListener("storage", onStorage)
      if (presenceInterval) clearInterval(presenceInterval)
      if (clearPresence) window.removeEventListener("beforeunload", clearPresence)
      if (!admin && !db) {
        const pkey = `presence_${currentUserId}`
        try {
          localStorage.setItem(pkey, JSON.stringify({ online: false, lastSeen: Date.now() }))
        } catch {}
      }
    }
  }, [chatId])

  function persistMessage(payload) {
    if (db) {
      const chatRef = ref(db, `chats/${chatId}`)
      set(push(chatRef), payload)
      return
    }
    const key = `mock_chat_${chatId}`
    try {
      const stored = JSON.parse(localStorage.getItem(key) || "[]")
      stored.push(payload)
      localStorage.setItem(key, JSON.stringify(stored))
      setMessages(stored)
      // Permite que useNotifications recalcule de inmediato en la misma pestaña
      // (el evento "storage" nativo solo dispara en otras pestañas).
      window.dispatchEvent(new Event("va-local-chat-updated"))
    } catch (e) {
      console.error("Error saving mock message", e)
    }
  }

  function enviarTexto(value) {
    const trimmed = value.trim()
    if (!trimmed) return
    persistMessage({ senderId: currentUserId, text: trimmed, timestamp: Date.now() })
    setText("")
  }

  function enviar() {
    enviarTexto(text)
  }

  function readAndCompressImage(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        const img = new window.Image()
        img.onload = () => {
          const maxDim = 1024
          let { width, height } = img
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width)
              width = maxDim
            } else {
              width = Math.round((width * maxDim) / height)
              height = maxDim
            }
          }
          const canvas = document.createElement("canvas")
          canvas.width = width
          canvas.height = height
          canvas.getContext("2d").drawImage(img, 0, 0, width, height)
          resolve(canvas.toDataURL("image/jpeg", 0.7))
        }
        img.onerror = reject
        img.src = reader.result
      }
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  async function handleImageSelected(e) {
    const file = e.target.files?.[0]
    e.target.value = ""
    if (!file) return
    try {
      const imageUrl = await readAndCompressImage(file)
      persistMessage({ senderId: currentUserId, imageUrl, timestamp: Date.now() })
    } catch (err) {
      console.error("Error al procesar la imagen:", err)
    }
  }

  function getSenderLabel(senderId) {
    if (senderId === currentUserId) return t("chat.senderYou")
    if (senderId === "admin" || senderId === "bot") return t("chat.senderStore")
    return t("chat.senderClient")
  }

  return (
    <div className="screen chat-screen">
      <div className="topbar">
        <button className="back" onClick={() => navigate(-1)} aria-label="Volver">
          <Icon name="back" size={18} />
        </button>
        <div style={{ flex: 1 }}>
          <h1 style={{ margin: 0, fontSize: 16 }}>{admin ? t("chat.titleAdmin", { name: chatId }) : t("chat.titleGuest")}</h1>
          <p className="topbar-subtitle">{admin ? t("chat.subtitleAdmin") : t("chat.subtitleGuest")}</p>
        </div>
        {!admin && localStorage.getItem("villaacero_guest_id") && (
          <button
            className="btn-logout"
            onClick={() => {
              localStorage.removeItem("villaacero_guest_id")
              navigate("/")
            }}
            style={{ marginLeft: 8 }}
            title={t("chat.guestLogout")}
          >
            <span style={{ marginLeft: 8 }}>{t("chat.guestLogout")}</span>
          </button>
        )}
      </div>

      <div className="content" style={{ display: "flex", flexDirection: "column", flex: 1 }}>
        {!db && (
          <div className="chat-banner">
            {t("chat.offlineBanner")}
          </div>
        )}

        {messages.length === 0 && (
          <div className="empty-state">
            <div className="glyph">💬</div>
            {t("chat.emptyState")}
          </div>
        )}

        {messages.map((m, i) => {
          const senderLabel = getSenderLabel(m.senderId)
          const timeText = m.timestamp ? new Date(m.timestamp).toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit" }) : ""
          return (
            <div key={i} className={`chat-bubble ${m.senderId === currentUserId ? "user" : "bot"}`}>
              {m.imageUrl ? (
                <img src={m.imageUrl} alt={t("chat.photoAlt")} className="chat-bubble-image" />
              ) : (
                <div className="message-text">{m.text}</div>
              )}
              <div className="message-meta">
                <span>{senderLabel}</span>
                <span>{timeText}</span>
              </div>
            </div>
          )
        })}

        <div ref={bottomRef} />
      </div>

      <div className="chat-input-bar">
        {!admin && (
          <div className="chat-quick-replies">
            <button type="button" onClick={() => enviarTexto(t("chat.quickSizesMessage"))}>{t("chat.quickSizes")}</button>
            <button type="button" onClick={() => enviarTexto(t("chat.quickOrderHelpMessage"))}>{t("chat.quickOrderHelp")}</button>
            <button type="button" onClick={() => enviarTexto(t("chat.quickDeliveryMessage"))}>{t("chat.quickDelivery")}</button>
          </div>
        )}
        <div style={{ display: "flex", gap: 8 }}>
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleImageSelected}
            style={{ display: "none" }}
          />
          <button
            type="button"
            className="btn btn-ghost"
            style={{ width: "auto", padding: "11px 14px" }}
            aria-label={t("chat.attachPhoto")}
            title={t("chat.attachPhoto")}
            onClick={() => fileInputRef.current?.click()}
          >
            <Icon name="image" size={18} />
          </button>
          <input
            placeholder={t("chat.inputPlaceholder")}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && enviar()}
          />
          <button className="btn btn-primary" style={{ width: "auto", padding: "11px 18px" }} onClick={enviar}>
            {t("chat.send")}
          </button>
        </div>
      </div>
    </div>
  )
}
