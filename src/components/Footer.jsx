import { useNavigate } from "react-router-dom"
import { useLanguage } from "../context/LanguageContext.jsx"

export default function Footer() {
  const navigate = useNavigate()
  const { t } = useLanguage()

  return (
    <footer className="site-footer">
      <div className="site-footer-info">
        <p className="site-footer-info-title">{t("footer.scheduleTitle")}</p>
        <p>{t("footer.scheduleHours")}</p>
        <p>{t("footer.address")}</p>
        <a href="tel:+56978450427" className="site-footer-contact">
          {t("footer.contactLabel")}: +56 9 7845 0427
        </a>
      </div>

      <div className="site-footer-payment">
        <span className="site-footer-payment-title">{t("footer.paymentTitle")}</span>
        <img
          src="/formasdepago.png"
          alt={t("footer.paymentTitle")}
          className="site-footer-payment-image"
          loading="lazy"
          onError={(e) => {
            e.currentTarget.style.display = "none"
          }}
        />
      </div>

      <div className="site-footer-links">
        <button type="button" className="footer-link" onClick={() => navigate("/contacto")}>
          {t("footer.contactLink")}
        </button>
        <span className="site-footer-links-sep">·</span>
        <button type="button" className="footer-link" onClick={() => navigate("/terminos-y-condiciones")}>
          {t("footer.termsLink")}
        </button>
      </div>

      <p className="site-footer-rights">{t("footer.rights")}</p>
    </footer>
  )
}
