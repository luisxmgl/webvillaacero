import { useNavigate } from "react-router-dom"
import { getLocalOrders } from "../utils.js"

export default function MyOrders() {
  const navigate = useNavigate()
  const orders = getLocalOrders()

  return (
    <div className="screen">
      <div className="topbar">
        <button className="back" onClick={() => navigate(-1)} aria-label="Volver">
          ←
        </button>
        <h1 style={{ flex: 1 }}>Mis pedidos</h1>
      </div>

      <div className="content">
        {orders.length === 0 ? (
          <div className="empty-state">
            <div className="glyph">VA</div>
            Todavía no tienes pedidos guardados en este equipo.
          </div>
        ) : (
          orders.map((code) => (
            <div key={code} className="school-row" onClick={() => navigate("/seguimiento", { state: { code } })}>
              <div className="initial">#</div>
              <div>
                <div className="name">Pedido {code}</div>
                <div className="comuna">Toca para ver el estado</div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
