// 1. Ve a la consola de Firebase: https://console.firebase.google.com
// 2. Abre tu proyecto (el mismo que usa la app Android).
// 3. Si todavía no tienes una "app web" registrada: Configuración del proyecto > tus apps > Agregar app > Web (</>)
// 4. Copia el objeto firebaseConfig que te entrega y pégalo abajo, reemplazando los valores de ejemplo.
// 5. Asegúrate de que Realtime Database esté habilitada (mismo proyecto que usa "pedidos" y "chats").

// Your web app's Firebase configuration (from Firebase console)
const firebaseConfig = {
  apiKey: "AIzaSyBxBQYbWslQZOrqpHeTbADKAGqOJGTSXqQ",
  authDomain: "apptienda-3302c.firebaseapp.com",
  projectId: "apptienda-3302c",
  storageBucket: "apptienda-3302c.firebasestorage.app",
  messagingSenderId: "803122927653",
  appId: "1:803122927653:web:e822cd17e73bb9e011c7cc",
  measurementId: "G-1CYLWM2PV4",
  // NOTE: Realtime Database URL is not always included in the web snippet.
  // If your project uses Realtime Database, ensure this matches your DB URL.
  // Example (may be correct):
  // databaseURL: "https://apptienda-3302c-default-rtdb.firebaseio.com",
}

import { initializeApp } from "firebase/app"
import { getDatabase } from "firebase/database"
import { getAnalytics } from "firebase/analytics"

let _db = null
const isPlaceholderConfig = !firebaseConfig.apiKey || firebaseConfig.apiKey.includes("TU_")

if (!isPlaceholderConfig) {
  const app = initializeApp(firebaseConfig)
  try {
    _db = getDatabase(app)
  } catch (e) {
    console.warn("Realtime Database not available or databaseURL missing in firebaseConfig:", e.message)
  }
  try {
    // initialize analytics if available in this environment
    getAnalytics(app)
  } catch (e) {
    // ignore analytics errors in non-browser or when not supported
  }
  console.info("Firebase initialized")
} else {
  console.warn(
    "Firebase configuration in src/firebase.js looks like a placeholder. Realtime Database will be disabled until you paste your project's firebaseConfig."
  )
}

export const db = _db
