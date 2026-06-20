import express from "express";
import { WebpayPlus, Options, Environment, IntegrationApiKeys, IntegrationCommerceCodes } from "transbank-sdk";
import { updatePedido } from "./firebaseAdmin.js";

const router = express.Router();

function buildTransaction() {
  const commerceCode = process.env.WEBPAY_COMMERCE_CODE || IntegrationCommerceCodes.WEBPAY_PLUS;
  const apiKey = process.env.WEBPAY_API_KEY || IntegrationApiKeys.WEBPAY;
  const environment = process.env.WEBPAY_ENVIRONMENT === "production" ? Environment.Production : Environment.Integration;
  return new WebpayPlus.Transaction(new Options(commerceCode, apiKey, environment));
}

// POST /api/webpay/create  body: { orderCode, amount }  ->  { token, url }
router.post("/create", async (req, res) => {
  const { orderCode, amount } = req.body || {};
  if (!orderCode || !amount || amount <= 0) {
    return res.status(400).json({ error: "orderCode y amount son requeridos" });
  }
  try {
    const tx = buildTransaction();
    const sessionId = `${orderCode}-${Date.now()}`;
    const returnUrl = process.env.WEBPAY_RETURN_URL || `http://localhost:${process.env.API_PORT || 3001}/api/webpay/return`;
    const response = await tx.create(orderCode, sessionId, Math.round(amount), returnUrl);
    res.json({ token: response.token, url: response.url });
  } catch (e) {
    console.error("Error creando transacción Webpay:", e.message);
    res.status(500).json({ error: "No se pudo iniciar el pago con Webpay" });
  }
});

// Transbank redirige el navegador aquí tras el pago (POST en éxito/rechazo, también puede llegar
// como cancelación del propio Transbank vía TBK_TOKEN antes de llegar al banco).
async function handleReturn(req, res) {
  const frontendBase = process.env.FRONTEND_BASE_URL || "http://localhost:5173";
  const body = { ...req.query, ...req.body };
  const tokenWs = body.token_ws;
  const tbkOrderCode = body.TBK_ORDEN_COMPRA;

  if (!tokenWs) {
    // Cancelación en la página de Transbank, antes de llegar al banco: nunca se llama a commit().
    if (tbkOrderCode) {
      await updatePedido(tbkOrderCode, { pagado: false, pagoEstado: "anulado" });
    }
    return res.redirect(`${frontendBase}/pago-resultado?orderCode=${tbkOrderCode || ""}&estado=anulado`);
  }

  try {
    const tx = buildTransaction();
    const result = await tx.commit(tokenWs);
    const aprobado = result.response_code === 0 && result.status === "AUTHORIZED";
    await updatePedido(result.buy_order, {
      pagado: aprobado,
      pagoEstado: aprobado ? "aprobado" : "rechazado",
      webpayAuthorizationCode: result.authorization_code,
      webpayResponseCode: result.response_code,
    });
    res.redirect(`${frontendBase}/pago-resultado?orderCode=${result.buy_order}&estado=${aprobado ? "ok" : "rechazado"}`);
  } catch (e) {
    console.error("Error confirmando transacción Webpay:", e.message);
    res.redirect(`${frontendBase}/pago-resultado?estado=error`);
  }
}

router.post("/return", handleReturn);
router.get("/return", handleReturn);

export default router;
