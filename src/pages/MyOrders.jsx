import { useNavigate } from "react-router-dom"
import { getLocalOrders } from "../utils.js"
import { useLanguage } from "../context/LanguageContext.jsx"

export default function MyOrders() {
  const navigate = useNavigate()
  const { t } = useLanguage()
  const orders = getLocalOrders()

  return (
    <div className="screen">
      <div className="topbar">
        <button className="back" onClick={() => navigate(-1)} aria-label="Volver">
          ←
        </button>
        <h1 style={{ flex: 1 }}>{t("myOrders.title")}</h1>
      </div>

      <div className="content">
        {orders.length === 0 ? (
          <div className="empty-state">
            <div className="glyph">VA</div>
            {t("myOrders.empty")}
          </div>
        ) : (
          orders.map((code) => (
            <div key={code} className="school-row" onClick={() => navigate("/seguimiento", { state: { code } })}>
              <div className="initial">#</div>
              <div>
                <div className="name">{t("myOrders.orderLabel", { code })}</div>
                <div className="comuna">{t("myOrders.tapToSee")}</div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
