import { useMemo } from "react"
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

const COLUMN_COUNT = 4
// Cada columna dura distinto para que no se muevan todas en sincronía (efecto más orgánico).
const COLUMN_DURATIONS = [34, 42, 38, 46]

function splitIntoColumns(images, columns) {
  const result = Array.from({ length: columns }, () => [])
  images.forEach((src, i) => result[i % columns].push(src))
  return result
}

export default function TopSlider() {
  const columns = useMemo(
    () => splitIntoColumns(SLIDE_IMAGES.map((file) => `/slide/${file}`), COLUMN_COUNT),
    []
  )

  return (
    <div className="global-top-banner">
      <img
        src="/logopagina.jpg"
        alt="Logo Villa Acero"
        className="top-main-logo"
        loading="eager"
      />
      <LanguageSwitcher />
      <div className="marquee-wall" aria-label="Galería de imágenes de Villa Acero">
        {columns.map((colImages, i) => (
          <div className="marquee-col" key={i}>
            <div
              className={`marquee-col-track ${i % 2 === 1 ? "marquee-up" : "marquee-down"}`}
              style={{ animationDuration: `${COLUMN_DURATIONS[i % COLUMN_DURATIONS.length]}s` }}
            >
              {[...colImages, ...colImages].map((src, j) => (
                <img key={j} src={src} alt="" loading={j < colImages.length ? "eager" : "lazy"} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
