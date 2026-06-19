import { useEffect, useState, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { openWhatsApp } from "../utils.js"

export default function SchoolSelector() {
  const navigate = useNavigate()
  const isAdmin = localStorage.getItem("va_isAdmin") === "1"
  const [colegios, setColegios] = useState([])
  const [search, setSearch] = useState("")
  const [comuna, setComuna] = useState("Todas")

  useEffect(() => {
    fetch("/catalogo.json")
      .then((r) => r.json())
      .then(setColegios)
  }, [])

  const comunas = useMemo(() => {
    const set = new Set(colegios.map((c) => c.comuna))
    return ["Todas", ...Array.from(set).sort()]
  }, [colegios])

  const filtered = colegios.filter((c) => {
    const matchComuna = comuna === "Todas" || c.comuna === comuna
    const q = search.toLowerCase()
    const matchSearch = c.nombre.toLowerCase().includes(q) || c.comuna.toLowerCase().includes(q)
    return matchComuna && matchSearch
  })

  return (
    <div className="screen">
      <div className="topbar">
        <h1 style={{ flex: 1 }}>{isAdmin ? "Panel administrador" : "Selecciona tu colegio"}</h1>
        <button className="back" aria-label="Información" onClick={() => navigate("/sobre-nosotros")}>
          ⓘ
        </button>
      </div>

      <div className="content">
        <input
          placeholder="Buscar colegio o comuna..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ marginBottom: 14 }}
        />

        <div className="chip-row" style={{ marginBottom: 18 }}>
          {comunas.map((c) => (
            <button
              key={c}
              className={`chip ${comuna === c ? "active" : ""}`}
              onClick={() => setComuna(c)}
            >
              {c}
            </button>
          ))}
        </div>

        {filtered.length === 0 && colegios.length > 0 && (
          <div className="empty-state">
            <div className="glyph">⚲</div>
            No encontramos colegios con ese filtro.
          </div>
        )}

        {filtered.map((colegio) => (
          <div
            key={colegio.id}
            className="school-row"
            onClick={() => navigate(`/tienda/${colegio.id}`)}
          >
            <div className="initial">{colegio.nombre.charAt(0)}</div>
            <div>
              <div className="name">{colegio.nombre}</div>
              <div className="comuna">{colegio.comuna}</div>
            </div>
          </div>
        ))}
      </div>

      {!isAdmin && (
        <button
          className="fab"
          aria-label="Contactar por WhatsApp"
          onClick={() => openWhatsApp("Hola! Quería consultar sobre los uniformes.")}
        >
          💬
        </button>
      )}

      <nav className="bottom-nav">
        {!isAdmin && (
          <a href="/chat" onClick={(e) => { e.preventDefault(); navigate("/chat") }}>
            Chat con la tienda
          </a>
        )}
        <a href={isAdmin ? "/admin/mensajes" : "/mis-pedidos"} onClick={(e) => { e.preventDefault(); navigate(isAdmin ? "/admin/mensajes" : "/mis-pedidos") }}>
          {isAdmin ? "Mensajes" : "Mis pedidos"}
        </a>
        <a href={isAdmin ? "/admin/pedidos" : "/seguimiento"} onClick={(e) => { e.preventDefault(); navigate(isAdmin ? "/admin/pedidos" : "/seguimiento") }}>
          {isAdmin ? "Gestión" : "Seguimiento"}
        </a>
      </nav>
    </div>
  )
}
