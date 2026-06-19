import { ref, push, onValue, update, remove } from "firebase/database"
import { db } from "../firebase.js"

const LOCAL_QUEUE_KEY = "va_chatbot_queue"
const LOCAL_RULES_KEY = "va_chatbot_custom_rules"

function readLocalQueue() {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_QUEUE_KEY) || "{}")
  } catch {
    return {}
  }
}

function writeLocalQueue(data) {
  localStorage.setItem(LOCAL_QUEUE_KEY, JSON.stringify(data))
}

function readLocalRules() {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_RULES_KEY) || "[]")
  } catch {
    return []
  }
}

export function pushUnansweredQuestion({ chatId, text }) {
  const entry = { chatId, text, timestamp: Date.now(), resolved: false }
  if (db) {
    const queueRef = ref(db, "chatbot_queue")
    push(queueRef, entry)
    return
  }
  const data = readLocalQueue()
  data[`local_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`] = entry
  writeLocalQueue(data)
  window.dispatchEvent(new Event("va_chatbot_queue_changed"))
}

export function subscribeQueue(callback) {
  if (db) {
    const queueRef = ref(db, "chatbot_queue")
    return onValue(queueRef, (snap) => {
      const data = snap.val() || {}
      const list = Object.entries(data)
        .map(([id, value]) => ({ id, ...value }))
        .filter((item) => !item.resolved)
        .sort((a, b) => b.timestamp - a.timestamp)
      callback(list)
    })
  }
  const emit = () => {
    const data = readLocalQueue()
    const list = Object.entries(data)
      .map(([id, value]) => ({ id, ...value }))
      .filter((item) => !item.resolved)
      .sort((a, b) => b.timestamp - a.timestamp)
    callback(list)
  }
  emit()
  window.addEventListener("va_chatbot_queue_changed", emit)
  window.addEventListener("storage", emit)
  return () => {
    window.removeEventListener("va_chatbot_queue_changed", emit)
    window.removeEventListener("storage", emit)
  }
}

export function resolveQueueItem(id) {
  if (db && !id.startsWith("local_")) {
    remove(ref(db, `chatbot_queue/${id}`))
    return
  }
  const data = readLocalQueue()
  delete data[id]
  writeLocalQueue(data)
  window.dispatchEvent(new Event("va_chatbot_queue_changed"))
}

export function addCustomRule({ keywords, answer }) {
  const entry = { keywords, answer, createdAt: Date.now() }
  if (db) {
    push(ref(db, "chatbot_rules"), entry)
    return
  }
  const rules = readLocalRules()
  rules.push(entry)
  localStorage.setItem(LOCAL_RULES_KEY, JSON.stringify(rules))
  window.dispatchEvent(new Event("va_chatbot_rules_changed"))
}

export function subscribeCustomRules(callback) {
  if (db) {
    const rulesRef = ref(db, "chatbot_rules")
    return onValue(rulesRef, (snap) => {
      const data = snap.val() || {}
      callback(Object.entries(data).map(([id, value]) => ({ id, ...value })))
    })
  }
  const emit = () => callback(readLocalRules().map((r, i) => ({ id: `local_${i}`, ...r })))
  emit()
  window.addEventListener("va_chatbot_rules_changed", emit)
  window.addEventListener("storage", emit)
  return () => {
    window.removeEventListener("va_chatbot_rules_changed", emit)
    window.removeEventListener("storage", emit)
  }
}
