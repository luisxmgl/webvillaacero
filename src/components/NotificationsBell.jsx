import { useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useLanguage } from "../context/LanguageContext.jsx"
import { useNotifications } from "../hooks/useNotifications.js"

export default function NotificationsBell({ isAdmin }) {
  const { t } = useLanguage()
  const navigate = useNavigate()
  const { items, markSeen, markAllSeen } = useNotifications(isAdmin, t)
  const [open, setOpen] = useState(false)
  const wrapperRef = useRef(null)

  useEffect(() => {
    function onClickOutside(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener("mousedown", onClickOutside)
    return () => document.removeEventListener("mousedown", onClickOutside)
  }, [])

  function openNotification(n) {
    markSeen(n)
    setOpen(false)
    navigate(n.link, n.navState ? { state: n.navState } : undefined)
  }

  return (
    <div className="notif-bell-wrapper" ref={wrapperRef}>
      <button
        type="button"
        className="nav-item notif-bell-button"
        aria-label={t("nav.notifications")}
        onClick={() => setOpen((o) => !o)}
      >
        <span className="notif-bell-icon" aria-hidden="true">
          🔔
          {items.length > 0 && <span className="notif-bell-badge">{items.length > 9 ? "9+" : items.length}</span>}
        </span>
        <span>{t("nav.notifications")}</span>
      </button>

      {open && (
        <div className="notif-panel">
          <div className="notif-panel-header">
            <strong>{t("notifications.title")}</strong>
            {items.length > 0 && (
              <button type="button" className="notif-mark-all" onClick={markAllSeen}>
                {t("notifications.markAllRead")}
              </button>
            )}
          </div>
          {items.length === 0 ? (
            <p className="notif-empty">{t("notifications.empty")}</p>
          ) : (
            <ul className="notif-list">
              {items.map((n) => (
                <li key={n.id}>
                  <button type="button" className={`notif-item notif-item-${n.type}`} onClick={() => openNotification(n)}>
                    {n.text}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
