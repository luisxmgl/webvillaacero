import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { ref, push, set } from "firebase/database"
import { db } from "../firebase.js"
import { buildProducto, formatPrice, openWhatsApp, getPoints, redeemPoints, generateOrderCode, saveLocalOrder } from "../utils.js"
import { useCart } from "../context/CartContext.jsx"

export default function ProductDetail() {
  const { colegioId, idproducto } = useParams()
  const navigate = useNavigate()
  const { addItem } = useCart()
  const [producto, setProducto] = useState(null)
  const [relacionados, setRelacionados] = useState([])
  const [confirmando, setConfirmando] = useState(false)
  const [mensaje, setMensaje] = useState("")

  useEffect(() => {
    fetch("/catalogo.json")
      .then((r) => r.json())
      .then((data) => {
        const colegio = data.find((c) => c.id === colegioId)
        if (!colegio) return
        const found = colegio.productos.find((p) => p.idproducto === idproducto)
        if (found) setProducto(buildProducto(found, colegio.nombre))
        setRelacionados(
          colegio.productos
            .filter((p) => p.idproducto !== idproducto)
            .slice(0, 6)
            .map((p) => buildProducto(p, colegio.nombre))
        )
      })
  }, [colegioId, idproducto])

  if (!producto) {
    return (
      <div className="screen">
        <div className="content">Cargando...</div>
      </div>
    )
  }

  function handleAgregar() {
    addItem(producto)
    navigate(-1)
  }

  function handleCanjear() {
    const puntos = getPoints()
    if (puntos < producto.puntosCost) {
      setMensaje(`No tienes suficientes Villa Puntos (tienes: ${puntos})`)
      return
    }
    setConfirmando(true)
  }

  async function confirmarCanje() {
    if (!redeemPoints(producto.puntosCost)) return
    const orderCode = generateOrderCode()
    const pedido = {
      id: orderCode,
      codigoRetiro: orderCode,
      items: [{ nombre: producto.nombre, talla: producto.talla, precio: 0, cantidad: 1, colegio: producto.colegio }],
      total: 0,
      extraCharge: 0,
      customization: "CANJE POR VILLA PUNTOS",
      estado: 1,
      fecha: Date.now(),
      procesado: false,
    }
    try {
      await set(ref(db, `pedidos/${orderCode}`), pedido)
    } catch (e) {
      console.error("Error al guardar en Firebase", e)
    }
    saveLocalOrder(orderCode)
    setMensaje(`¡Canje exitoso! Tu código: ${orderCode}`)
    setConfirmando(false)
    setTimeout(() => navigate(-1), 1800)
  }

  return (
    <div className="screen">
      <div className="topbar">
        <button className="back" onClick={() => navigate(-1)} aria-label="Volver">
          ←
        </button>
        <h1 style={{ flex: 1, fontSize: 16 }}>{producto.nombre}</h1>
      </div>

      <div className="content">
        <div className="product-card" style={{ cursor: "default", marginBottom: 18 }}>
          <div className="swatch" style={{ height: 140, fontSize: 32 }}>
            VA
          </div>
        </div>

        <p className="label-tag" style={{ marginBottom: 10 }}>
          {producto.colegio}
        </p>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: 22, margin: "0 0 6px" }}>{producto.nombre}</h2>
        <p style={{ fontFamily: "var(--font-display)", color: "var(--thread)", fontSize: 22, fontWeight: 600, margin: "0 0 16px" }}>
          {formatPrice(producto.precio)}
        </p>
        <p style={{ color: "var(--muted)", fontSize: 14, lineHeight: 1.6 }}>{producto.descripcion}</p>

        <hr className="stitch-divider" />

        <button className="btn btn-primary" onClick={handleAgregar}>
          Agregar al carrito
        </button>

        <button className="btn btn-outline" style={{ marginTop: 10 }} onClick={handleCanjear}>
          Canjear por {producto.puntosCost} Villa Puntos
        </button>

        <button
          className="btn btn-ghost"
          style={{ marginTop: 14 }}
          onClick={() => openWhatsApp(`Hola! Me interesa el producto: ${producto.nombre} del colegio: ${producto.colegio}`)}
        >
          Consultar por WhatsApp
        </button>

        {mensaje && <p style={{ marginTop: 14, fontSize: 13.5, color: "var(--ink)" }}>{mensaje}</p>}

        {relacionados.length > 0 && (
          <>
            <hr className="stitch-divider" />
            <h3 style={{ fontFamily: "var(--font-display)", fontSize: 17, margin: "0 0 12px" }}>Completa el uniforme</h3>
            <div style={{ display: "flex", gap: 12, overflowX: "auto" }}>
              {relacionados.map((p) => (
                <div
                  key={p.idproducto}
                  className="product-card"
                  style={{ minWidth: 140 }}
                  onClick={() => navigate(`/producto/${colegioId}/${p.idproducto}`)}
                >
                  <div className="swatch">VA</div>
                  <div className="name">{p.nombre}</div>
                  <div className="price">{formatPrice(p.precio)}</div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {confirmando && (
        <div className="modal-overlay" onClick={() => setConfirmando(false)}>
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontFamily: "var(--font-display)" }}>Canjear producto</h3>
            <p style={{ color: "var(--muted)", fontSize: 14 }}>
              ¿Deseas canjear {producto.nombre} por {producto.puntosCost} Villa Puntos?
            </p>
            <button className="btn btn-primary" style={{ marginTop: 14 }} onClick={confirmarCanje}>
              Canjear
            </button>
            <button className="btn btn-ghost" style={{ marginTop: 10 }} onClick={() => setConfirmando(false)}>
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
