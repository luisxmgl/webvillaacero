import { useEffect, useState, useMemo } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { buildProducto, formatPrice, openWhatsApp } from "../utils.js"
import { useCart } from "../context/CartContext.jsx"

export default function Store() {
  const { colegioId } = useParams()
  const navigate = useNavigate()
  const { items } = useCart()
  const [colegio, setColegio] = useState(null)
  const [filtro, setFiltro] = useState("TODOS")

  useEffect(() => {
    fetch("/catalogo.json")
      .then((r) => r.json())
      .then((data) => {
        const found = data.find((c) => c.id === colegioId)
        setColegio(found || null)
      })
  }, [colegioId])

  const productos = useMemo(() => {
    if (!colegio) return []
    return colegio.productos.map((p) => buildProducto(p, colegio.nombre))
  }, [colegio])

  const categorias = useMemo(() => {
    const set = new Set(productos.map((p) => p.nombre.split(" T-")[0].trim()))
    return ["TODOS", "Menor precio", ...Array.from(set).sort()]
  }, [productos])

  const visibles = useMemo(() => {
    if (filtro === "TODOS") return productos
    if (filtro === "Menor precio") return [...productos].sort((a, b) => a.precio - b.precio)
    return productos.filter((p) => p.nombre.startsWith(filtro))
  }, [productos, filtro])

  const cartCount = items.reduce((s, i) => s + i.cantidad, 0)

  return (
    <div className="screen">
      <div className="topbar">
        <button className="back" onClick={() => navigate(-1)} aria-label="Volver">
          ←
        </button>
        <h1 style={{ flex: 1 }}>{colegio ? colegio.nombre : "Tienda"}</h1>
        <button className="back" onClick={() => openWhatsApp(`Hola! Quería consultar sobre los uniformes de ${colegio?.nombre ?? ""}.`)} aria-label="WhatsApp">
          💬
        </button>
        <button className="back" onClick={() => navigate("/chat")} aria-label="Chat con la tienda">
          ✉️
        </button>
        <button className="back" onClick={() => navigate("/carrito")} aria-label="Carrito" style={{ position: "relative" }}>
          🛒
          {cartCount > 0 && (
            <span style={{ position: "absolute", top: -2, right: -2, background: "var(--thread)", borderRadius: "50%", width: 16, height: 16, fontSize: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
              {cartCount}
            </span>
          )}
        </button>
      </div>

      <div className="content">
        <div className="chip-row" style={{ marginBottom: 18, overflowX: "auto", flexWrap: "nowrap" }}>
          {categorias.map((c) => (
            <button key={c} className={`chip ${filtro === c ? "active" : ""}`} onClick={() => setFiltro(c)} style={{ flexShrink: 0 }}>
              {c}
            </button>
          ))}
        </div>

        {colegio && visibles.length === 0 && (
          <div className="empty-state">
            <div className="glyph">⚲</div>
            Sin productos en esta categoría.
          </div>
        )}

        <div className="product-grid">
          {visibles.map((p) => (
            <div key={p.idproducto} className="product-card" onClick={() => navigate(`/producto/${colegioId}/${p.idproducto}`)}>
              <div className="swatch">VA</div>
              <div className="name">{p.nombre}</div>
              <div className="price">{formatPrice(p.precio)}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
