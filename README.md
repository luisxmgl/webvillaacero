# Confecciones Villa Acero — versión web

Versión web (React + Vite) de la app Android `aplicaciontienda`, conectada a la misma base de datos de Firebase Realtime Database (`pedidos`, `chats`). Mismo flujo: selección de colegio, catálogo, carrito con asistente de personalización, pago por WhatsApp o Webpay, seguimiento de pedido, Villa Puntos, y panel de administrador.

## 1. Instalar dependencias

```bash
npm install
```

## 2. Conectar tu Firebase real

Abre `src/firebase.js` y reemplaza el objeto `firebaseConfig` con el de tu proyecto:

1. Ve a [Firebase console](https://console.firebase.google.com) → tu proyecto (el mismo que usa la app Android).
2. Configuración del proyecto → tus apps → si no existe una app web, agrégala (ícono `</>`).
3. Copia el `firebaseConfig` que te entrega y pégalo en `src/firebase.js`.
4. Verifica que **Realtime Database** esté habilitada y que las reglas permitan lectura/escritura en `pedidos` y `chats` (las mismas que usa la app Android).

No necesitas tocar nada más: el catálogo de productos se sirve desde `public/catalogo.json` (generado a partir del mismo `catalogo_limpio.json` que usa la app), igual que en Android.

## 3. Ejecutar en desarrollo

```bash
npm run dev
```

Abre la URL que te muestre la terminal (normalmente `http://localhost:5173`). Esto alcanza para todo excepto el pago con Webpay (catálogo, carrito, WhatsApp, Caja con efectivo/tarjeta/transferencia).

Para que el pago con **Webpay** funcione en desarrollo, necesitas levantar también el servidor de API:

```bash
npm run dev:all
```

Esto corre Vite (`5173`) y el servidor Express (`3001`) al mismo tiempo; Vite reenvía las llamadas a `/api/*` al servidor automáticamente. Sin ningún archivo `.env`, Webpay ya funciona contra el ambiente de pruebas de Transbank (sandbox, sin dinero real) — ver `.env.example` para los datos de tarjetas de prueba y para cómo conectar tus credenciales reales cuando vayas a producción (nunca compartas esas credenciales fuera de tu `.env`, que ya está en `.gitignore`).

## 4. Compilar para producción

```bash
npm run build
```

Esto genera la carpeta `dist/`, lista para subir a cualquier hosting (Firebase Hosting, Vercel, Netlify, etc.). Si usas Firebase Hosting, es el camino más directo porque ya comparte proyecto con tu Realtime Database.

## Notas importantes

- **Login de administrador**: hoy usa el mismo usuario/clave fijos que la app Android (`administrador` / `2026`), tal cual estaba en el código original. Funciona, pero no es seguro para producción — antes de publicar la web, te recomiendo migrar esto a Firebase Authentication.
- **Catálogo**: se regenera desde el JSON de origen con el mismo filtro de colegios permitidos y el mismo cálculo de Villa Puntos, descripciones y precios que la app Android (ver `src/utils.js`).
- **Puntos y pedidos guardados**: en Android se guardan en `SharedPreferences` (por dispositivo); en la web se guardan en `localStorage` (por navegador) — mismo comportamiento, equivalente web.
- **Chat interno**: la ruta `/chat` abre el chat de un invitado con la tienda (equivalente a `ChatActivity`), accesible desde el botón ✉️ en la tienda y desde "Chat con la tienda" en el menú inferior del selector de colegio. El panel admin lo gestiona desde "Mensajes" (lista de conversaciones con vista previa del último mensaje, ordenadas por actividad reciente) → al abrir una, entra a la conversación con ese cliente específico. El historial completo queda guardado en Firebase (`chats/{id}`) y se recarga cada vez que se abre la conversación. Un invitado solo puede chatear con la tienda (no ve ni puede chatear con otros invitados); el administrador ve y puede responder a todas las conversaciones. Todavía no tiene subida de imágenes (la app Android sí permite adjuntar fotos vía Firebase Storage); se puede agregar después si lo necesitas.
- **Favoritos**: la app Android tiene una pantalla de favoritos que no se incluyó en esta primera versión web — puedo agregarla si la necesitas.
- **Caja (venta en tienda física)**: `/admin/caja` (botón "Abrir caja" desde "Gestión de pedidos") es una pantalla de punto de venta para vendedores: buscar productos de cualquier colegio, armar la venta, y cobrar en efectivo (con cálculo de vuelto), tarjeta (se cobra en el POS físico del local, este sistema no lee tarjetas — solo registra el método) o transferencia. Al cobrar, queda guardada en `pedidos/{codigo}` igual que un pedido online, marcada como ya entregada y pagada, con un recibo imprimible.
- **Webpay Plus real**: el botón "Pagar con Webpay" del carrito usa el SDK oficial de Transbank (`transbank-sdk`) a través de un pequeño servidor Express (`server.js` + `server/webpay.js`), no un link falso. Requiere `npm run dev:all` en desarrollo (ver sección 3) y, para producción, tus credenciales reales de comercio (ver `.env.example`) más una cuenta de servicio de Firebase para que el servidor pueda marcar el pedido como pagado tras el commit.

## Estructura

```
src/
  pages/        Cada pantalla (equivalente a cada Activity de Android)
  components/    Asistente de personalización, modal de confirmación
  context/        Estado del carrito
  firebase.js     Configuración de Firebase (completar con tus credenciales)
  utils.js        Lógica equivalente a Utils.kt, Producto.kt, PointsManager.kt
public/catalogo.json   Catálogo de productos (mismo origen que la app Android)
server.js              Servidor Express: en producción sirve dist/, y siempre expone /api/webpay/*
server/                Rutas y helpers del servidor (Webpay Plus, Firebase Admin)
```
