import es from "./es.js"
import en from "./en.js"
import pt from "./pt.js"
import fr from "./fr.js"

export const LANGS = { es, en, pt, fr }

export const LANG_META = [
  { code: "es", label: "Español", flag: "🇨🇱" },
  { code: "en", label: "English", flag: "🇺🇸" },
  { code: "pt", label: "Português", flag: "🇧🇷" },
  { code: "fr", label: "Français", flag: "🇫🇷" },
]

export const DEFAULT_LANG = "es"
