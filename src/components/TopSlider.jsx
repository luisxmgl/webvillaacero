import { useEffect, useMemo, useState } from "react"
import LanguageSwitcher from "./LanguageSwitcher.jsx"

const SLIDE_IMAGES = [
  "1.jpg",
  "2.jpg",
  "3.jpg",
  "4.jpg",
  "5.jpg",
  "6.jpg",
  "7.jpg",
  "8.jpg",
  "9.jpg",
  "10.jpg",
  "11.jpg",
  "12.jpg",
  "13.jpg",
  "14.jpg",
  "15.jpg",
  "16.jpg",
  "17.jpg",
  "18.jpg",
  "19.jpg",
  "20.jpg",
  "21.jpg",
  "22.jpg",
  "23.jpg",
  "24.jpg",
  "25.jpg",
  "26.jpg",
  "27.jpg",
  "28.jpg",
  "29.jpg",
  "30.jpg",
  "31.jpg",
  "32.jpg",
  "33.jpg",
  "34.jpg",
  "35.jpg",
  "36.jpg",
  "37.jpeg",
  "38.jpeg",
  "39.jpeg",
  "40.jpeg",
  "41.jpeg",
]

export default function TopSlider() {
  const slides = useMemo(
    () => SLIDE_IMAGES.map((file) => `/slide/${file}`),
    []
  )
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((current) => (current + 1) % slides.length)
    }, 2000)
    return () => clearInterval(interval)
  }, [slides.length])

  return (
    <div className="global-top-banner">
      <img
        src="/logopagina.jpg"
        alt="Logo Villa Acero"
        className="top-main-logo"
        loading="eager"
      />
      <LanguageSwitcher />
      <div className="slide-frame" aria-label="Galería de imágenes de Villa Acero">
        <img
          src={slides[activeIndex]}
          alt="Promoción de Villa Acero"
          className="slide-image"
          loading="eager"
        />
      </div>
    </div>
  )
}
