import { createContext, useContext, useEffect, useRef, useState } from "react"
import { useLocation } from "react-router-dom"
import { getCurrentIdentity, resetPersonalState } from "../utils.js"

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const [items, setItems] = useState([])
  const location = useLocation()
  const identityRef = useRef(null)

  // El carrito vive en memoria durante toda la sesión del navegador, sin importar
  // qué pantalla se visite -- pero admin e invitados (y un invitado distinto que
  // use el mismo equipo) son personas distintas. Cada vez que la identidad actual
  // cambia (lo cual siempre ocurre junto con una navegación: login o "cerrar
  // sesión"), se vacía el carrito y el estado personal (pedidos guardados)
  // para que nadie vea lo que eligió la persona anterior.
  useEffect(() => {
    const current = getCurrentIdentity()
    if (identityRef.current === null) {
      identityRef.current = current
      return
    }
    if (current !== identityRef.current) {
      identityRef.current = current
      setItems([])
      resetPersonalState()
    }
  }, [location.key])

  function addItem(producto) {
    setItems((prev) => {
      const existing = prev.find((i) => i.producto.idproducto === producto.idproducto)
      if (existing) {
        return prev.map((i) =>
          i.producto.idproducto === producto.idproducto ? { ...i, cantidad: i.cantidad + 1 } : i
        )
      }
      return [...prev, { producto, cantidad: 1 }]
    })
  }

  function updateQuantity(idproducto, delta) {
    setItems((prev) =>
      prev
        .map((i) => (i.producto.idproducto === idproducto ? { ...i, cantidad: i.cantidad + delta } : i))
        .filter((i) => i.cantidad > 0)
    )
  }

  function removeItem(idproducto) {
    setItems((prev) => prev.filter((i) => i.producto.idproducto !== idproducto))
  }

  function clear() {
    setItems([])
  }

  const total = items.reduce((sum, i) => sum + i.producto.precio * i.cantidad, 0)

  return (
    <CartContext.Provider value={{ items, addItem, updateQuantity, removeItem, clear, total }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  return useContext(CartContext)
}
