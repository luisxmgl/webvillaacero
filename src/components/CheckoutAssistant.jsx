import { useState } from "react"
import { formatPrice } from "../utils.js"
import { useLanguage } from "../context/LanguageContext.jsx"

function buildSteps(t) {
  return {
    inicio: {
      bot: t("checkoutAssistant.inicio"),
      options: [
        { label: t("checkoutAssistant.inicioOpt1"), next: "ajustes" },
        { label: t("checkoutAssistant.inicioOpt2"), next: "talla" },
        { label: t("checkoutAssistant.inicioOpt3"), next: "fin", skipExtras: true },
      ],
    },
    ajustes: {
      bot: t("checkoutAssistant.ajustes"),
      options: [
        { label: t("checkoutAssistant.ajustesOpt1"), next: "bordado", extra: 1000, note: t("checkoutAssistant.ajustesNote1") },
        { label: t("checkoutAssistant.ajustesOpt2"), next: "bordado", extra: 1000, note: t("checkoutAssistant.ajustesNote2") },
        { label: t("checkoutAssistant.ajustesOpt3"), next: "bordado", extra: 1000, note: t("checkoutAssistant.ajustesNote3") },
        { label: t("checkoutAssistant.ajustesOpt4"), next: "bordado" },
      ],
    },
    bordado: {
      bot: t("checkoutAssistant.bordado"),
      options: [
        { label: t("checkoutAssistant.bordadoOpt1"), next: "bordado_lugar" },
        { label: t("checkoutAssistant.bordadoOpt2"), next: "talla" },
      ],
    },
    bordado_lugar: {
      bot: t("checkoutAssistant.bordadoLugar"),
      options: [
        { label: t("checkoutAssistant.bordadoLugarOpt1"), next: "talla", extra: 1000, note: t("checkoutAssistant.bordadoLugarNote1") },
        { label: t("checkoutAssistant.bordadoLugarOpt2"), next: "talla", extra: 1000, note: t("checkoutAssistant.bordadoLugarNote2") },
        { label: t("checkoutAssistant.bordadoLugarOpt3"), next: "talla", extra: 1000, note: t("checkoutAssistant.bordadoLugarNote3") },
      ],
    },
    talla: {
      bot: t("checkoutAssistant.talla"),
      options: [
        { label: t("checkoutAssistant.tallaOpt1"), next: "regalo", note: t("checkoutAssistant.tallaNote1") },
        { label: t("checkoutAssistant.tallaOpt2"), next: "regalo", note: t("checkoutAssistant.tallaNote2") },
      ],
    },
    regalo: {
      bot: t("checkoutAssistant.regalo"),
      options: [
        { label: t("checkoutAssistant.regaloOpt1"), next: "plazo", note: t("checkoutAssistant.regaloNote1") },
        { label: t("checkoutAssistant.regaloOpt2"), next: "plazo" },
      ],
    },
    plazo: {
      bot: t("checkoutAssistant.plazo"),
      options: [
        { label: t("checkoutAssistant.plazoOpt1"), next: "fin", note: t("checkoutAssistant.plazoNote1") },
        { label: t("checkoutAssistant.plazoOpt2"), next: "fin", note: t("checkoutAssistant.plazoNote2") },
        { label: t("checkoutAssistant.plazoOpt3"), next: "fin", note: t("checkoutAssistant.plazoNote3") },
      ],
    },
  }
}

export default function CheckoutAssistant({ onComplete, onClose }) {
  const { t } = useLanguage()
  const STEPS = buildSteps(t)
  const [stepKey, setStepKey] = useState("inicio")
  const [history, setHistory] = useState([{ bot: true, text: STEPS.inicio.bot }])
  const [extraCharge, setExtraCharge] = useState(0)
  const [notes, setNotes] = useState([])
  const [finished, setFinished] = useState(false)

  const step = STEPS[stepKey]

  function choose(option) {
    setHistory((h) => [...h, { bot: false, text: option.label }])
    const newExtra = extraCharge + (option.extra || 0)
    const newNotes = option.note ? [...notes, option.note] : notes
    setExtraCharge(newExtra)
    setNotes(newNotes)

    if (option.next === "fin") {
      const summaryText = option.skipExtras
        ? t("checkoutAssistant.summaryStandard")
        : newNotes.length > 0
        ? t("checkoutAssistant.summaryWithNotes", { notes: newNotes.join(", "), amount: formatPrice(newExtra) })
        : t("checkoutAssistant.summaryNoExtras")
      setHistory((h) => [...h, { bot: true, text: summaryText }, { bot: true, text: t("checkoutAssistant.confirmQuestion") }])
      setFinished(true)
      return
    }

    const nextStep = STEPS[option.next]
    setHistory((h) => [...h, { bot: true, text: nextStep.bot }])
    setStepKey(option.next)
  }

  function confirmar() {
    onComplete(extraCharge, notes.join(", "))
  }

  return (
    <div className="modal-overlay">
      <div className="modal-sheet">
        <div style={{ display: "flex", flexDirection: "column" }}>
          {history.map((m, i) => (
            <div key={i} className={`chat-bubble ${m.bot ? "bot" : "user"}`}>
              {m.text}
            </div>
          ))}
        </div>

        {!finished && (
          <div className="assistant-options">
            {step.options.map((opt) => (
              <button key={opt.label} onClick={() => choose(opt)}>
                {opt.label}
              </button>
            ))}
          </div>
        )}

        {finished && (
          <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={confirmar}>
            {t("checkoutAssistant.confirmButton")}
          </button>
        )}

        <button className="btn btn-ghost" style={{ marginTop: 10 }} onClick={onClose}>
          {t("checkoutAssistant.cancel")}
        </button>
      </div>
    </div>
  )
}
