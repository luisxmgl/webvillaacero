import { Outlet, useLocation, useNavigate } from "react-router-dom"
import TopSlider from "./TopSlider.jsx"
import NotificationsBell from "./NotificationsBell.jsx"
import Footer from "./Footer.jsx"

import gestionIcon from "../../public/icono_gestion.png"
import chatIcon from "../../public/chat_icono.png"
import whatsappIcon from "../../public/chatwhatsapp.png"
import cartIcon from "../../public/carrito-de-compras.png"
import instagramIcon from "../../public/instagramicono.png"
import { useCart } from "../context/CartContext.jsx"
import { useLanguage } from "../context/LanguageContext.jsx"

export default function GlobalLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const { t } = useLanguage()
  const isAdmin = localStorage.getItem("va_isAdmin") === "1"
  const showFloatingActions = location.pathname !== "/admin/login"
  const { items } = useCart()
  const cartCount = items.reduce((s, i) => s + i.cantidad, 0)

  return (
    <div className="app-with-slider">
      <TopSlider />
      <div className="route-wrapper">
        <Outlet />
        <Footer />
      </div>

      {showFloatingActions && (
        <nav className="bottom-nav">
          <button
            className={`nav-item whatsapp-item`}
            aria-label={t("nav.whatsapp")}
            onClick={() => window.open('https://wa.me/56920680021', '_blank')}
          >
            <img src={whatsappIcon} alt="WhatsApp" width={24}  height={24} />
            <span>{t("nav.whatsapp")}</span>
          </button>

          <button
            className={`nav-item ${location.pathname === (isAdmin ? "/admin/mensajes" : "/chat") ? "active" : ""}`}
            aria-label={isAdmin ? t("nav.messages") : t("store.chat")}
            onClick={() => (window.location.href = isAdmin ? "/admin/mensajes" : "/chat")}
          >
            <img src={chatIcon} alt="Chat" width={20} height={20} />
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

          <NotificationsBell isAdmin={isAdmin} />

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
            onClick={() => navigate(isAdmin ? "/admin/pedidos" : "/carrito")}
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
