import { useEffect, useState, useMemo } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import Icon from "../components/Icons.jsx"
import { useLanguage } from "../context/LanguageContext.jsx"

export default function SchoolSelector() {
  const navigate = useNavigate()
  const location = useLocation()
  const { t } = useLanguage()
  const isAdmin = localStorage.getItem("va_isAdmin") === "1"
  const [colegios, setColegios] = useState([])
  const [search, setSearch] = useState("")
  const [comuna, setComuna] = useState("Todas")

  useEffect(() => {
    fetch("/catalogo.json")
      .then((r) => r.json())
      .then(setColegios)
  }, [])

  const schoolLogoMap = {
    "sagrados corazones": "logo_sagradoscorazones.png",
    "san cristobal": "logo_sancristobal.png",
    "thomas jefferson": "logo_thomasjeffersonschool.png",
    "tjs": "logo_thomasjeffersonschool.png",
    "kingston college": "logo_kingstoncollege.png",
    "high scope": "logo_highscope.png",
    "highscope": "logo_highscope.png",
    "inmaculada": "logo_inmaculada.jpg",
    "bautista": "logo_bautista.png",
    "pinares": "logo_pinares.png",
    "itahue": "logo_colegioitahue.png",
    "concepcion": "logo_concepcionpv.png",
    "preston": "logo_preston.png",
    "santa leonor": "logo_santaleonor.jpg",
    "sta leonor": "logo_santaleonor.jpg",
    "leonor": "logo_santaleonor.jpg",
    "villa acero": "logo_villaacero.png",
  }

  function normalizeSchoolName(nombre) {
    return nombre
      .toLowerCase()
      .replace(/\./g, "")
      .replace(/\s+/g, " ")
      .trim()
  }

  function getSchoolLogo(nombre) {
    const normalized = normalizeSchoolName(nombre)
    // First try exact match
    if (schoolLogoMap[normalized]) {
      return `/${schoolLogoMap[normalized]}`
    }
    // Then try includes (for partial matches)
    for (const key in schoolLogoMap) {
      if (key.length > 2 && normalized.includes(key)) {
        return `/${schoolLogoMap[key]}`
      }
    }
    return null
  }

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

  function selectComuna(c) {
    setComuna(c)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <div className="screen">
      <div className="topbar">
        <h1 style={{ flex: 1 }}>{isAdmin ? t("schoolSelector.titleAdmin") : t("schoolSelector.titleGuest")}</h1>
        {isAdmin && (
          <button
            className="btn-logout"
            onClick={() => {
              localStorage.removeItem("va_isAdmin")
              localStorage.removeItem("va_admin_remembered")
              navigate("/")
            }}
            aria-label={t("schoolSelector.logout")}
          >
            <span style={{ marginLeft: 8 }}>{t("schoolSelector.logout")}</span>
          </button>
        )}

        {!isAdmin && localStorage.getItem("villaacero_guest_id") && (
          <button
            className="btn-logout"
            onClick={() => {
              localStorage.removeItem("villaacero_guest_id")
              navigate("/")
            }}
            aria-label={t("schoolSelector.guestLogout")}
            title={t("schoolSelector.guestLogout")}
          >
            <span style={{ marginLeft: 8 }}>{t("schoolSelector.guestLogout")}</span>
          </button>
        )}

        <button className="back icon-button" aria-label={t("schoolSelector.info")} onClick={() => navigate("/sobre-nosotros")}>
          <Icon name="info" size={18} />
        </button>
      </div>

      <div className="content">
        <input
          placeholder={t("schoolSelector.searchPlaceholder")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ marginBottom: 14 }}
        />

        <div className="chip-row" style={{ marginBottom: 18 }}>
          {comunas.map((c) => (
            <button
              key={c}
              className={`chip ${comuna === c ? "active" : ""}`}
              onClick={() => selectComuna(c)}
            >
              {c === "Todas" ? t("schoolSelector.filterAll") : c}
            </button>
          ))}
        </div>

        {filtered.length === 0 && colegios.length > 0 && (
          <div className="empty-state">
            <div className="glyph">⚲</div>
            {t("schoolSelector.noResults")}
          </div>
        )}

        {filtered.map((colegio) => {
          const logoSrc = getSchoolLogo(colegio.nombre)
          return (
            <div
              key={colegio.id}
              className="school-row"
              onClick={() => navigate(`/tienda/${colegio.id}`)}
            >
              <div className="school-logo-circle">
                {logoSrc ? (
                  <img src={logoSrc} alt={`${colegio.nombre} logo`} />
                ) : (
                  <span>{colegio.nombre.charAt(0)}</span>
                )}
              </div>
              <div>
                <div className="name">{colegio.nombre}</div>
                <div className="comuna">{colegio.comuna}</div>
              </div>
            </div>
          )
        })}
      </div>

    </div>
  )
}
