import { useEffect, useRef, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { ref, push, set, onValue } from "firebase/database"
import { db } from "../firebase.js"
import { getGuestId } from "../utils.js"

export default function Chat({ admin = false }) {
  const navigate = useNavigate()
  const { chatId: targetId } = useParams()
  const currentUserId = admin ? "admin" : getGuestId()
  const chatId = admin ? targetId : currentUserId

  const [messages, setMessages] = useState([])
  const [text, setText] = useState("")
  const bottomRef = useRef(null)

  useEffect(() => {
    if (!chatId) return
    const chatRef = ref(db, `chats/${chatId}`)
    const unsubscribe = onValue(chatRef, (snap) => {
      const data = snap.val() || {}
      const list = Object.values(data).sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0))
      setMessages(list)
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50)
    })
    return () => unsubscribe()
  }, [chatId])

  function enviar() {
    const value = text.trim()
    if (!value) return
    const chatRef = ref(db, `chats/${chatId}`)
    const newRef = push(chatRef)
    set(newRef, { senderId: currentUserId, text: value, timestamp: Date.now() })
    setText("")
  }

  return (
    <div className="screen">
      <div className="topbar">
        <button className="back" onClick={() => navigate(-1)} aria-label="Volver">
          ←
        </button>
        <h1 style={{ flex: 1, fontSize: 16 }}>{admin ? `Chat con ${chatId}` : "Chat con Villa Acero"}</h1>
      </div>

      <div className="content" style={{ display: "flex", flexDirection: "column", flex: 1, paddingBottom: 90 }}>
        {messages.length === 0 && (
          <div className="empty-state">
            <div className="glyph">💬</div>
            Escribe tu primer mensaje para iniciar la conversación.
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`chat-bubble ${m.senderId === currentUserId ? "user" : "bot"}`}>
            {m.text}
          </div>
        ))}
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
          gap: 8,
          padding: 12,
          background: "var(--paper)",
          borderTop: "1px dashed var(--line)",
        }}
      >
        <input
          placeholder="Escribe un mensaje..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && enviar()}
        />
        <button className="btn btn-primary" style={{ width: "auto", padding: "11px 18px" }} onClick={enviar}>
          Enviar
        </button>
      </div>
    </div>
  )
}
