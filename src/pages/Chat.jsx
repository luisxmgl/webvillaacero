import { useEffect, useRef, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { ref, push, set, get, onValue, onDisconnect } from "firebase/database"
import { db } from "../firebase.js"
import { getGuestId } from "../utils.js"
import Icon from "../components/Icons.jsx"
import { useLanguage } from "../context/LanguageContext.jsx"
import { buildDefaultRules, matchRule, extractOrderCode } from "../chatbot/rules.js"
import { pushUnansweredQuestion, subscribeCustomRules } from "../chatbot/queue.js"

export default function Chat({ admin = false }) {
  const navigate = useNavigate()
  const { t } = useLanguage()
  const { chatId: targetId } = useParams()
  const currentUserId = admin ? "admin" : getGuestId()
  const chatId = admin ? targetId : currentUserId

  const [messages, setMessages] = useState([])
  const [loaded, setLoaded] = useState(false)
  const [text, setText] = useState("")
  const [botTyping, setBotTyping] = useState(false)
  const [customRules, setCustomRules] = useState([])
  const bottomRef = useRef(null)
  const greetedRef = useRef(false)
  const awaitingOrderCodeRef = useRef(false)

  useEffect(() => {
    if (admin) return
    return subscribeCustomRules(setCustomRules)
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
    }

    if (db) {
      try {
        const chatRef = ref(db, `chats/${chatId}`)
        const unsubscribe = onValue(chatRef, (snap) => {
          const data = snap.val() || {}
          const list = Object.values(data).sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0))
          setMessages(list)
          setLoaded(true)
          markSeen()
          if (list.length) setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50)
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
      setLoaded(true)
      markSeen()
      if (stored.length) setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50)
    } catch {
      setMessages([])
      setLoaded(true)
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
    } catch (e) {
      console.error("Error saving mock message", e)
    }
  }

  function sendBotMessage(value) {
    persistMessage({ senderId: "bot", text: value, timestamp: Date.now() })
  }

  function estadoLabel(estado) {
    return estado === 4 ? t("adminOrders.estado4") : t(`tracking.estado${estado}`)
  }

  function notaForEstado(estado) {
    if (estado === 1) return t("tracking.nota1")
    if (estado === 2) return t("tracking.nota2")
    if (estado === 3) return t("tracking.nota3")
    return ""
  }

  async function runBot(userText) {
    setBotTyping(true)
    const delay = 600 + Math.random() * 500

    if (awaitingOrderCodeRef.current) {
      awaitingOrderCodeRef.current = false
      const code = extractOrderCode(userText)
      setTimeout(async () => {
        setBotTyping(false)
        if (!code) {
          sendBotMessage(t("chatbot.orderNotFound", { code: userText.trim() }))
          return
        }
        try {
          const snap = db ? await get(ref(db, `pedidos/${code}`)) : null
          if (snap && snap.exists()) {
            const p = snap.val()
            sendBotMessage(t("chatbot.orderStatus", { code, status: estadoLabel(p.estado), note: notaForEstado(p.estado) }))
          } else {
            sendBotMessage(t("chatbot.orderNotFound", { code }))
          }
        } catch (e) {
          sendBotMessage(t("chatbot.orderNotFound", { code }))
        }
      }, delay)
      return
    }

    const allRules = [...customRules, ...buildDefaultRules(t)]
    const rule = matchRule(userText, allRules)

    setTimeout(() => {
      setBotTyping(false)
      if (!rule) {
        sendBotMessage(t("chatbot.fallback"))
        pushUnansweredQuestion({ chatId, text: userText })
        return
      }
      if (rule.action === "ASK_ORDER_CODE") {
        awaitingOrderCodeRef.current = true
        sendBotMessage(t("chatbot.askOrderCode"))
        return
      }
      sendBotMessage(rule.answer)
    }, delay)
  }

  function enviarTexto(value) {
    const trimmed = value.trim()
    if (!trimmed) return
    persistMessage({ senderId: currentUserId, text: trimmed, timestamp: Date.now() })
    setText("")
    if (!admin) runBot(trimmed)
  }

  function enviar() {
    enviarTexto(text)
  }

  useEffect(() => {
    if (admin || !chatId || !loaded || messages.length > 0 || greetedRef.current) return
    greetedRef.current = true
    sendBotMessage(t("chatbot.greeting"))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [admin, chatId, loaded, messages.length])

  function getSenderLabel(senderId) {
    if (senderId === currentUserId) return t("chat.senderYou")
    if (senderId === "admin" || senderId === "bot") return t("chat.senderStore")
    return t("chat.senderClient")
  }

  return (
    <div className="screen">
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
              navigate("/admin/login")
            }}
            style={{ marginLeft: 8 }}
            title={t("chat.guestLogout")}
          >
            <span style={{ marginLeft: 8 }}>{t("chat.guestLogout")}</span>
          </button>
        )}
      </div>

      <div className="content" style={{ display: "flex", flexDirection: "column", flex: 1, paddingBottom: admin ? 90 : 220 }}>
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
              <div className="message-text">{m.text}</div>
              <div className="message-meta">
                <span>{senderLabel}</span>
                <span>{timeText}</span>
              </div>
            </div>
          )
        })}

        {botTyping && (
          <div className="chat-bubble bot chat-bubble-typing">
            <div className="message-text">{t("chat.botTyping")}</div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: "50%",
          transform: "translateX(-50%)",
          width: "100%",
          maxWidth: 480,
          display: "flex",
          flexDirection: "column",
          gap: 8,
          padding: 12,
          background: "var(--paper)",
          borderTop: "1px dashed var(--line)",
        }}
      >
        {!admin && (
          <div className="assistant-options" style={{ margin: 0 }}>
            <button type="button" onClick={() => enviarTexto(t("chat.quickSizesMessage"))}>{t("chat.quickSizes")}</button>
            <button type="button" onClick={() => enviarTexto(t("chat.quickOrderHelpMessage"))}>{t("chat.quickOrderHelp")}</button>
            <button type="button" onClick={() => enviarTexto(t("chat.quickDeliveryMessage"))}>{t("chat.quickDelivery")}</button>
          </div>
        )}
        <div style={{ display: "flex", gap: 8 }}>
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
