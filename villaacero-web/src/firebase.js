// 1. Ve a la consola de Firebase: https://console.firebase.google.com
// 2. Abre tu proyecto (el mismo que usa la app Android).
// 3. Si todavía no tienes una "app web" registrada: Configuración del proyecto > tus apps > Agregar app > Web (</>)
// 4. Copia el objeto firebaseConfig que te entrega y pégalo abajo, reemplazando los valores de ejemplo.
// 5. Asegúrate de que Realtime Database esté habilitada (mismo proyecto que usa "pedidos" y "chats").

const firebaseConfig = {
  apiKey: "TU_API_KEY",
  authDomain: "tu-proyecto.firebaseapp.com",
  databaseURL: "https://tu-proyecto-default-rtdb.firebaseio.com",
  projectId: "tu-proyecto",
  storageBucket: "tu-proyecto.appspot.com",
  messagingSenderId: "000000000000",
  appId: "1:000000000000:web:xxxxxxxxxxxxxxxxxxxxxx",
}

import { initializeApp } from "firebase/app"
import { getDatabase } from "firebase/database"

const app = initializeApp(firebaseConfig)
export const db = getDatabase(app)
