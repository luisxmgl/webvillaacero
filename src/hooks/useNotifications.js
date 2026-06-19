import { useEffect, useState } from "react"
import { ref, onValue } from "firebase/database"
import { db } from "../firebase.js"
import { getGuestId, getLocalOrders } from "../utils.js"

const SEEN_CHAT_KEY = (id) => `va_seen_chat_${id}`
const SEEN_ORDER_ESTADO_KEY = (code) => `va_seen_order_estado_${code}`
const ADMIN_ORDERS_SEEN_KEY = "va_admin_orders_seen"

function mergeByType(prev, type, fresh) {
  const others = prev.filter((p) => p.type !== type)
  return [...others, ...fresh].sort((a, b) => b.timestamp - a.timestamp)
}

function estadoLabel(estado, t) {
  return estado === 4 ? t("adminOrders.estado4") : t(`tracking.estado${estado}`)
}

export function useNotifications(isAdmin, t) {
  const [items, setItems] = useState([])

  useEffect(() => {
    if (!db) return
    const unsubs = []

    if (isAdmin) {
      const chatsRef = ref(db, "chats")
      unsubs.push(
        onValue(chatsRef, (snap) => {
          const data = snap.val() || {}
          const fresh = []
          Object.entries(data).forEach(([chatId, msgsObj]) => {
            const list = Object.values(msgsObj || {}).sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0))
            const last = list[list.length - 1]
            if (!last || last.senderId === "admin") return
            const rawSeen = localStorage.getItem(`opened_chat_${chatId}`)
            const seenAt = rawSeen === "1" ? Infinity : Number(rawSeen) || 0
            if ((last.timestamp || 0) > seenAt) {
              fresh.push({
                id: `chat_${chatId}`,
                type: "chat",
                text: t("notifications.newChatAdmin", { name: chatId }),
                timestamp: last.timestamp || 0,
                link: `/admin/chat/${chatId}`,
              })
            }
          })
          setItems((prev) => mergeByType(prev, "chat", fresh))
        })
      )

      const pedidosRef = ref(db, "pedidos")
      unsubs.push(
        onValue(pedidosRef, (snap) => {
          const data = snap.val() || {}
          const seenAt = Number(localStorage.getItem(ADMIN_ORDERS_SEEN_KEY)) || 0
          const fresh = Object.values(data)
            .filter((p) => (p.fecha || 0) > seenAt)
            .map((p) => ({
              id: `order_${p.codigoRetiro}`,
              type: "order",
              text: t("notifications.newOrderAdmin", { code: p.codigoRetiro }),
              timestamp: p.fecha || 0,
              link: "/admin/pedidos",
            }))
          setItems((prev) => mergeByType(prev, "order", fresh))
        })
      )
    } else {
      const guestId = getGuestId()
      const chatRef = ref(db, `chats/${guestId}`)
      unsubs.push(
        onValue(chatRef, (snap) => {
          const data = snap.val() || {}
          const list = Object.values(data).sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0))
          const last = list[list.length - 1]
          const fresh = []
          if (last && last.senderId !== guestId) {
            const seenAt = Number(localStorage.getItem(SEEN_CHAT_KEY(guestId))) || 0
            if ((last.timestamp || 0) > seenAt) {
              fresh.push({
                id: `chat_${guestId}`,
                type: "chat",
                text: t("notifications.chatNewMessageAdmin"),
                timestamp: last.timestamp || 0,
                link: "/chat",
              })
            }
          }
          setItems((prev) => mergeByType(prev, "chat", fresh))
        })
      )

      const orderCodes = getLocalOrders()
      if (orderCodes.length) {
        const pedidosRef = ref(db, "pedidos")
        unsubs.push(
          onValue(pedidosRef, (snap) => {
            const data = snap.val() || {}
            const fresh = []
            orderCodes.forEach((code) => {
              const p = data[code]
              if (!p || !p.estado) return
              const seenEstado = Number(localStorage.getItem(SEEN_ORDER_ESTADO_KEY(code))) || 1
              if (p.estado > seenEstado) {
                fresh.push({
                  id: `order_${code}`,
                  type: "order",
                  text: t("notifications.orderUpdate", { code, status: estadoLabel(p.estado, t) }),
                  timestamp: p.fecha || 0,
                  link: "/seguimiento",
                  navState: { code },
                  meta: { code, estado: p.estado },
                })
              }
            })
            setItems((prev) => mergeByType(prev, "order", fresh))
          })
        )
      }
    }

    return () => unsubs.forEach((u) => typeof u === "function" && u())
  }, [isAdmin, t])

  function markSeen(notification) {
    if (notification.type === "chat") {
      const key = isAdmin ? `opened_chat_${notification.id.replace("chat_", "")}` : SEEN_CHAT_KEY(getGuestId())
      localStorage.setItem(key, String(Date.now()))
    } else if (notification.type === "order" && notification.meta) {
      localStorage.setItem(SEEN_ORDER_ESTADO_KEY(notification.meta.code), String(notification.meta.estado))
    }
    setItems((prev) => prev.filter((x) => x.id !== notification.id))
  }

  function markAllSeen() {
    items.forEach(markSeen)
    if (isAdmin) localStorage.setItem(ADMIN_ORDERS_SEEN_KEY, String(Date.now()))
  }

  return { items, markSeen, markAllSeen }
}
