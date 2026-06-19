import { createContext, useContext, useState } from "react"

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const [items, setItems] = useState([])

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
