export default function Icon({ name, size = 20, className = "", ...props }) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
    className: `icon-svg ${className}`.trim(),
    ...props,
  }

  switch (name) {
    case "back":
      return (
        <svg {...common}>
          <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
    case "info":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
          <path d="M12 8.5v1.6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          <path d="M12 12.5v3.2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      )
    case "chat":
      return (
        <svg {...common}>
          <path d="M4 4h16v12H8l-4 4V4z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M8 8h8M8 12h5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      )
    case "whatsapp":
      return (
        <svg {...common}>
          <path d="M12 2a10 10 0 1 0 10 10A10.011 10.011 0 0 0 12 2Z" stroke="currentColor" strokeWidth="1.6" />
          <path d="M15.3 15.7c-.3.8-1.6 1.5-2.2 1.6-.6.1-1.2.2-1.8 0-.7-.2-1.6-.8-2.3-1.4-1.3-1.2-2.2-2.7-2.3-4.5-.1-1.8.8-3.3 2-4.1.3-.2.8-.4 1.2-.4.8 0 1.6.2 2.2.5.7.3 1.4.8 2 1.3.5.4.7.9.5 1.5-.1.3-.3.6-.5.8-.2.2-.5.4-.7.2-.2-.1-.6-.2-1.1-.5-.4-.2-.8-.3-1.2-.2-.2 0-.5.1-.6.3-.1.1-.2.4 0 .8.2.5.8 1.1 1.7 1.8.9.7 1.4 1 1.7 1.3.3.3.3.6.2.8Z" fill="currentColor" />
        </svg>
      )
    case "cart":
      return (
        <svg {...common}>
          <path d="M6 6h15l-1.6 8.2a2 2 0 0 1-2 1.8H8.8a2 2 0 0 1-2-1.7L5 4H2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="9" cy="20" r="1" fill="currentColor" />
          <circle cx="18" cy="20" r="1" fill="currentColor" />
        </svg>
      )
    case "orders":
      return (
        <svg {...common}>
          <path d="M5 6h14M8 10h8M7 4h10a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
        </svg>
      )
    case "gestion":
      return <img src="/gestion.png" alt="Gestión" width={size} height={size} className={`icon-img ${className}`.trim()} />
    case "track":
      return (
        <svg {...common}>
          <path d="M12 2c3.6 0 6.5 2.9 6.5 6.5 0 4.7-4.2 8.8-6.2 10.7a1 1 0 0 1-1.4 0C9.7 17.3 5.5 13.2 5.5 7.5 5.5 4.9 8.4 2 12 2Z" stroke="currentColor" strokeWidth="1.6" />
          <circle cx="12" cy="8" r="1.5" fill="currentColor" />
        </svg>
      )
    case "logout":
      return (
        <svg {...common}>
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M16 17l5-5-5-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M21 12H9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
    case "send":
      return (
        <svg {...common}>
          <path d="M3 21l18-9L3 3v7l13 2-13 2v7Z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="currentColor" />
        </svg>
      )
    case "info-circle":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
          <path d="M12 8h.01M12 11v4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      )
    case "store":
      return (
        <svg {...common}>
          <path d="M3 7h18v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
          <path d="M3 7l9-5 9 5" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
          <path d="M8 12h8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      )
    default:
      return null
  }
}
