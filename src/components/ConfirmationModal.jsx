import { useEffect, useState } from "react"
import QRCode from "qrcode"
import { useLanguage } from "../context/LanguageContext.jsx"

export default function ConfirmationModal({ orderCode, onClose }) {
  const { t } = useLanguage()
  const [qrUrl, setQrUrl] = useState("")
  const [rating, setRating] = useState(null)
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
          {t("confirmationModal.registered")}
        </div>
        <div className="chat-bubble bot" style={{ textAlign: "left" }}>
          {t("confirmationModal.pickupCode")} <strong>{orderCode}</strong>
        </div>

        <button className="btn btn-outline" style={{ width: "auto", padding: "8px 18px", margin: "8px auto" }} onClick={copiar}>
          {copied ? t("confirmationModal.copiedCode") : t("confirmationModal.copyCode")}
        </button>

        <div className="chat-bubble bot" style={{ textAlign: "left" }}>
          {t("confirmationModal.showQr")}
        </div>

        {qrUrl && <img src={qrUrl} alt={`QR ${orderCode}`} style={{ margin: "12px 0" }} />}

        {!rating ? (
          <>
            <div className="chat-bubble bot" style={{ textAlign: "left" }}>
              {t("confirmationModal.rateQuestion")}
            </div>
            <div className="chat-bubble bot" style={{ textAlign: "left", fontSize: 13, color: "var(--muted)", marginTop: 4 }}>
              {t("confirmationModal.rateNote")}
            </div>
            <div style={{ display: "flex", justifyContent: "center", gap: 6, margin: "10px 0" }}>
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  onClick={() => setRating(n)}
                  style={{ background: "none", border: "none", fontSize: 26, cursor: "pointer" }}
                  aria-label={t("confirmationModal.starsLabel", { n })}
                >
                  ⭐
                </button>
              ))}
            </div>
          </>
        ) : (
          <>
            <div className="chat-bubble bot" style={{ textAlign: "left" }}>
              {t("confirmationModal.thanksRating")}
            </div>
            <div className="chat-bubble bot" style={{ textAlign: "left", fontSize: 13, color: "var(--muted)", marginTop: 4 }}>
              {t("confirmationModal.closeWhenReady")}
            </div>
          </>
        )}

        <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={onClose}>
          {t("confirmationModal.understood")}
        </button>
      </div>
    </div>
  )
}
