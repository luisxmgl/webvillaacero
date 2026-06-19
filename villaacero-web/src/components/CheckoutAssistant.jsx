import { useState } from "react"
import { formatPrice } from "../utils.js"

const STEPS = {
  inicio: {
    bot: "¡Hola! Soy tu Asistente Villa Acero. ¿Te gustaría personalizar tu ropa con ajustes o bordados?",
    options: [
      { label: "Sí, me interesa", next: "ajustes" },
      { label: "Solo confirmar tallas/regalo", next: "talla" },
      { label: "No, comprar estándar", next: "fin", skipExtras: true },
    ],
  },
  ajustes: {
    bot: "¿Necesitas que hagamos algún ajuste de medida? (Cada ajuste tiene un valor de $1.000)",
    options: [
      { label: "Ajuste de basta / largo", next: "bordado", extra: 1000, note: "Ajuste de basta" },
      { label: "Corte más ajustado (slim)", next: "bordado", extra: 1000, note: "Corte slim" },
      { label: "Ajustar largo de mangas", next: "bordado", extra: 1000, note: "Ajuste de mangas" },
      { label: "Sin ajustes, solo confirmar detalles", next: "bordado" },
    ],
  },
  bordado: {
    bot: "¿Te gustaría agregar el nombre bordado del alumno? (Valor: $1.000)",
    options: [
      { label: "Sí, agregar bordado", next: "bordado_lugar" },
      { label: "No, sin bordado", next: "talla" },
    ],
  },
  bordado_lugar: {
    bot: "¿En qué parte de la prenda prefieres el bordado?",
    options: [
      { label: "Pecho izquierdo", next: "talla", extra: 1000, note: "Bordado en pecho izquierdo" },
      { label: "Pecho derecho", next: "talla", extra: 1000, note: "Bordado en pecho derecho" },
      { label: "Espalda / cuello", next: "talla", extra: 1000, note: "Bordado en espalda/cuello" },
    ],
  },
  talla: {
    bot: "¿Estás seguro de la talla elegida? (Si tienes dudas, podemos asesorarte al retirar)",
    options: [
      { label: "Sí, la talla es correcta", next: "regalo", note: "Talla confirmada" },
      { label: "No estoy seguro, prefiero asesoría", next: "regalo", note: "Requiere asesoría de talla en tienda" },
    ],
  },
  regalo: {
    bot: "¿Te gustaría que envolvamos tu pedido para regalo? (Sin costo adicional)",
    options: [
      { label: "Sí, por favor", next: "plazo", note: "Envolver para regalo" },
      { label: "No es necesario", next: "plazo" },
    ],
  },
  plazo: {
    bot: "Para coordinar con el taller, ¿cuándo necesitas tener tu pedido en mano?",
    options: [
      { label: "Lo antes posible", next: "fin", note: "Prioridad normal" },
      { label: "Es para un regalo (esta semana)", next: "fin", note: "Urgencia: para esta semana" },
      { label: "No tengo prisa (próxima semana)", next: "fin", note: "Sin urgencia" },
    ],
  },
}

export default function CheckoutAssistant({ onComplete, onClose }) {
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
        ? "Perfecto, compra estándar sin personalización."
        : newNotes.length > 0
        ? `Resumen: ${newNotes.join(", ")}. Cargo extra: ${formatPrice(newExtra)}.`
        : "Resumen: sin ajustes adicionales."
      setHistory((h) => [...h, { bot: true, text: summaryText }, { bot: true, text: "¿Confirmamos tu pedido?" }])
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
            Confirmar y finalizar pedido
          </button>
        )}

        <button className="btn btn-ghost" style={{ marginTop: 10 }} onClick={onClose}>
          Cancelar
        </button>
      </div>
    </div>
  )
}
