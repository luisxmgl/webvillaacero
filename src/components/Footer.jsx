import { useLanguage } from "../context/LanguageContext.jsx"

export default function Footer() {
  const { t } = useLanguage()

  return (
    <footer className="site-footer">
      <div className="site-footer-payment">
        <span className="site-footer-payment-title">{t("footer.paymentTitle")}</span>
        <img
          src="/metodos-pago.png"
          alt={t("footer.paymentTitle")}
          className="site-footer-payment-image"
          loading="lazy"
          onError={(e) => {
            e.currentTarget.style.display = "none"
          }}
        />
      </div>
      <p className="site-footer-rights">{t("footer.rights")}</p>
    </footer>
  )
}
