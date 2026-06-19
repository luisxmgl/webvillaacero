import { Routes, Route } from "react-router-dom"
import Home from "./pages/Home.jsx"
import SchoolSelector from "./pages/SchoolSelector.jsx"
import Store from "./pages/Store.jsx"
import ProductDetail from "./pages/ProductDetail.jsx"
import Cart from "./pages/Cart.jsx"
import MyOrders from "./pages/MyOrders.jsx"
import Tracking from "./pages/Tracking.jsx"
import SobreNosotros from "./pages/SobreNosotros.jsx"
import AdminLogin from "./pages/AdminLogin.jsx"
import AdminOrders from "./pages/AdminOrders.jsx"
import AdminChatList from "./pages/AdminChatList.jsx"
import Chat from "./pages/Chat.jsx"

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/colegios" element={<SchoolSelector />} />
      <Route path="/tienda/:colegioId" element={<Store />} />
      <Route path="/producto/:colegioId/:idproducto" element={<ProductDetail />} />
      <Route path="/carrito" element={<Cart />} />
      <Route path="/mis-pedidos" element={<MyOrders />} />
      <Route path="/seguimiento" element={<Tracking />} />
      <Route path="/sobre-nosotros" element={<SobreNosotros />} />
      <Route path="/chat" element={<Chat />} />
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin/pedidos" element={<AdminOrders />} />
      <Route path="/admin/mensajes" element={<AdminChatList />} />
      <Route path="/admin/chat/:chatId" element={<Chat admin />} />
    </Routes>
  )
}
