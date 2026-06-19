import { useEffect, useRef, useState } from "react"
import { useLanguage } from "../context/LanguageContext.jsx"
import { LANG_META } from "../i18n/index.js"

export default function LanguageSwitcher() {
  const { lang, setLang, t } = useLanguage()
  const [open, setOpen] = useState(false)
  const wrapperRef = useRef(null)
  const current = LANG_META.find((l) => l.code === lang) || LANG_META[0]

  useEffect(() => {
    function onClickOutside(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener("mousedown", onClickOutside)
    return () => document.removeEventListener("mousedown", onClickOutside)
  }, [])

  return (
    <div className="lang-switcher" ref={wrapperRef}>
      <button
        type="button"
        className="lang-switcher-button"
        onClick={() => setOpen((o) => !o)}
        aria-label={t("languageSwitcher.label")}
        aria-expanded={open}
      >
        <span aria-hidden="true">{current.flag}</span>
        <span>{current.code.toUpperCase()}</span>
      </button>
      {open && (
        <div className="lang-switcher-menu" role="menu">
          {LANG_META.map((l) => (
            <button
              key={l.code}
              type="button"
              role="menuitem"
              className={`lang-switcher-option ${l.code === lang ? "active" : ""}`}
              onClick={() => {
                setLang(l.code)
                setOpen(false)
              }}
            >
              <span aria-hidden="true">{l.flag}</span>
              <span>{l.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
