import { initializeApp, getApps, cert, applicationDefault } from "firebase-admin/app";
import { getDatabase } from "firebase-admin/database";

let db = null;
let initAttempted = false;

function init() {
  if (initAttempted) return db;
  initAttempted = true;

  const databaseURL = process.env.FIREBASE_DATABASE_URL;
  if (!databaseURL) {
    console.warn("FIREBASE_DATABASE_URL no está configurado: las actualizaciones de pedidos desde el servidor quedarán deshabilitadas.");
    return null;
  }

  try {
    if (getApps().length === 0) {
      const inlineCredentials = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
      initializeApp({
        credential: inlineCredentials ? cert(JSON.parse(inlineCredentials)) : applicationDefault(),
        databaseURL,
      });
    }
    db = getDatabase();
  } catch (e) {
    console.warn("No se pudo inicializar firebase-admin (¿falta GOOGLE_APPLICATION_CREDENTIALS o FIREBASE_SERVICE_ACCOUNT_JSON?):", e.message);
    db = null;
  }
  return db;
}

export async function updatePedido(orderCode, patch) {
  const database = init();
  if (!database || !orderCode) {
    console.warn("No se pudo actualizar el pedido en Firebase (admin no configurado):", orderCode);
    return false;
  }
  try {
    await database.ref(`pedidos/${orderCode}`).update(patch);
    return true;
  } catch (e) {
    console.warn("Error actualizando pedido en Firebase:", e.message);
    return false;
  }
}
