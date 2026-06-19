import { useEffect, useState } from "react"
import QRCode from "qrcode"

export default function ConfirmationModal({ orderCode, onClose }) {
  const [qrUrl, setQrUrl] = useState("")
  const [rated, setRated] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    QRCode.toDataURL(orderCode, { width: 220, margin: 1 }).then(setQrUrl)
  }, [orderCode])

  function copiar() {
    navigator.clipboard.writeText(orderCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="modal-overlay">
      <div className="modal-sheet" style={{ textAlign: "center" }}>
        <div className="chat-bubble bot" style={{ textAlign: "left" }}>
          Tu pedido fue registrado con éxito.
        </div>
        <div className="chat-bubble bot" style={{ textAlign: "left" }}>
          Tu código de retiro es: <strong>{orderCode}</strong>
        </div>

        <button className="btn btn-outline" style={{ width: "auto", padding: "8px 18px", margin: "8px auto" }} onClick={copiar}>
          {copied ? "Código copiado" : "Copiar código"}
        </button>

        <div className="chat-bubble bot" style={{ textAlign: "left" }}>
          Muéstrale este código QR a la cajera al retirar tu pedido.
        </div>

        {qrUrl && <img src={qrUrl} alt={`Código QR del pedido ${orderCode}`} style={{ margin: "12px 0" }} />}

        {!rated ? (
          <>
            <div className="chat-bubble bot" style={{ textAlign: "left" }}>
              ¿Cómo calificarías tu experiencia?
            </div>
            <div style={{ display: "flex", justifyContent: "center", gap: 6, margin: "10px 0" }}>
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  onClick={() => setRated(true)}
                  style={{ background: "none", border: "none", fontSize: 26, cursor: "pointer" }}
                  aria-label={`${n} estrellas`}
                >
                  ⭐
                </button>
              ))}
            </div>
          </>
        ) : (
          <div className="chat-bubble bot" style={{ textAlign: "left" }}>
            ¡Gracias por tu calificación!
          </div>
        )}

        <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={onClose}>
          Entendido
        </button>
      </div>
    </div>
  )
}
