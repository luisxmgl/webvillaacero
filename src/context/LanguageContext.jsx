import { createContext, useCallback, useContext, useMemo, useState } from "react"
import { LANGS, DEFAULT_LANG } from "../i18n/index.js"

const LanguageContext = createContext(null)
const STORAGE_KEY = "va_lang"

function getByPath(obj, path) {
  return path.split(".").reduce((acc, key) => (acc && acc[key] !== undefined ? acc[key] : undefined), obj)
}

function interpolate(template, params) {
  if (!params) return template
  return template.replace(/\{(\w+)\}/g, (match, key) => (params[key] !== undefined ? params[key] : match))
}

function getInitialLang() {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored && LANGS[stored]) return stored
  return DEFAULT_LANG
}

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(getInitialLang)

  const setLang = useCallback((code) => {
    if (!LANGS[code]) return
    localStorage.setItem(STORAGE_KEY, code)
    setLangState(code)
  }, [])

  const t = useCallback(
    (key, params) => {
      const value = getByPath(LANGS[lang], key) ?? getByPath(LANGS[DEFAULT_LANG], key) ?? key
      return typeof value === "string" ? interpolate(value, params) : value
    },
    [lang]
  )

  const value = useMemo(() => ({ lang, setLang, t }), [lang, setLang, t])

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider")
  return ctx
}
