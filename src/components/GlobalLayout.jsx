import { useEffect } from "react"
import { Outlet, useLocation, useNavigate } from "react-router-dom"
import TopSlider from "./TopSlider.jsx"
import NotificationsBell from "./NotificationsBell.jsx"
import Footer from "./Footer.jsx"

import gestionIcon from "../../public/icono_gestion.png"
import chatIcon from "../../public/chat_icono.png"
import whatsappIcon from "../../public/chatwhatsapp.png"
import cartIcon from "../../public/carrito-de-compras.png"
import instagramIcon from "../../public/instagramicono.png"
import cajaIcon from "../../public/icons8-cashier-55.png"
import { useCart } from "../context/CartContext.jsx"
import { useLanguage } from "../context/LanguageContext.jsx"
import { useNotifications } from "../hooks/useNotifications.js"

export default function GlobalLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const { t } = useLanguage()
  const isAdmin = localStorage.getItem("va_isAdmin") === "1"
  // El menú flotante solo tiene sentido una vez que alguien "inició sesión" (invitado o
  // admin): ambos eligen su rol desde "/", y el admin además pasa por "/admin/login".
  // El logout (guest o admin) siempre redirige a "/", así que ocultarlo ahí también lo
  // hace desaparecer automáticamente al cerrar sesión.
  const showFloatingActions = location.pathname !== "/" && location.pathname !== "/admin/login"
  const { items } = useCart()
  const cartCount = items.reduce((s, i) => s + i.cantidad, 0)
  const { items: notifItems, markSeen, markAllSeen } = useNotifications(isAdmin, t)
  const hasUnreadChat = notifItems.some((n) => n.type === "chat")

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [location.pathname])

  return (
    <div className="app-with-slider">
      <TopSlider />
      <div className="route-wrapper">
        <Outlet />
        <Footer />
      </div>

      {showFloatingActions && (
        <nav className="bottom-nav">
          {!isAdmin && (
            <button
              className={`nav-item whatsapp-item`}
              aria-label={t("nav.whatsapp")}
              onClick={() => window.open('https://wa.me/56920680021', '_blank')}
            >
              <img src={whatsappIcon} alt="WhatsApp" width={24}  height={24} />
              <span>{t("nav.whatsapp")}</span>
            </button>
          )}

          <button
            className={`nav-item ${location.pathname === (isAdmin ? "/admin/mensajes" : "/chat") ? "active" : ""}`}
            aria-label={isAdmin ? t("nav.messages") : t("store.chat")}
            onClick={() => (window.location.href = isAdmin ? "/admin/mensajes" : "/chat")}
            style={{ position: "relative" }}
          >
            <img src={chatIcon} alt="Chat" width={20} height={20} />
            {hasUnreadChat && (
              <span style={{ position: "absolute", top: -4, right: -6, background: "var(--thread)", borderRadius: "50%", width: 10, height: 10, border: "2px solid #fff" }} />
            )}
            <span>{t("nav.messages")}</span>
          </button>

          <button
            className={`nav-item ${location.pathname === (isAdmin ? "/admin/pedidos" : "/mis-pedidos") ? "active" : ""}`}
            aria-label={t("nav.management")}
            onClick={() => navigate(isAdmin ? "/admin/pedidos" : "/mis-pedidos")}
          >
            <img src={gestionIcon} alt="Gestión" width={20} height={20} />
            <span>{t("nav.management")}</span>
          </button>

          {isAdmin && (
            <button
              className={`nav-item ${location.pathname === "/admin/caja" ? "active" : ""}`}
              aria-label={t("nav.caja")}
              onClick={() => navigate("/admin/caja")}
            >
              <img src={cajaIcon} alt="" width={20} height={20} />
              <span>{t("nav.caja")}</span>
            </button>
          )}

          <NotificationsBell items={notifItems} markSeen={markSeen} markAllSeen={markAllSeen} />

          <button
            className="nav-item"
            aria-label="Instagram"
            onClick={() => window.open("https://www.instagram.com/confecciones.villaacero/", "_blank")}
          >
            <img src={instagramIcon} alt="Instagram" width={20} height={20} />
            <span>{t("nav.instagram")}</span>
          </button>

          <button
            className="nav-item cart-item"
            aria-label={t("nav.cart")}
            onClick={() => navigate("/carrito")}
            style={{ position: "relative" }}
          >
            <img src={cartIcon} alt="Carrito" width={20} height={20} />
            {cartCount > 0 && (
              <span style={{ position: "absolute", top: -4, right: -6, background: "var(--thread)", borderRadius: "50%", width: 16, height: 16, fontSize: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
                {cartCount}
              </span>
            )}
            <span>{t("nav.cart")}</span>
          </button>
        </nav>
      )}
    </div>
  )
}
