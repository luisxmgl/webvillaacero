import express from "express";
import nodemailer from "nodemailer";

const router = express.Router();

function buildTransport() {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!host || !user || !pass) return null;
  const port = Number(process.env.SMTP_PORT || 587);
  return nodemailer.createTransport({
    host,
    port,
    secure: process.env.SMTP_SECURE === "1" || port === 465,
    auth: { user, pass },
  });
}

// POST /api/contacto  body: { nombre, email, telefono, mensaje }
router.post("/", async (req, res) => {
  const { nombre, email, telefono, mensaje } = req.body || {};
  if (!nombre || !email || !mensaje) {
    return res.status(400).json({ error: "nombre, email y mensaje son requeridos" });
  }

  const transporter = buildTransport();
  if (!transporter) {
    console.error("[contacto] SMTP no configurado. Mensaje recibido pero no enviado:", { nombre, email, telefono, mensaje });
    return res.status(503).json({ error: "El envío de correo no está configurado en el servidor" });
  }

  const to = process.env.CONTACT_EMAIL_TO || "luis.inostroza1998@gmail.com";

  try {
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to,
      replyTo: email,
      subject: `Contacto desde el sitio - ${nombre}`,
      text:
        `Nombre: ${nombre}\n` +
        `Email: ${email}\n` +
        `Teléfono: ${telefono || "-"}\n\n` +
        `Mensaje:\n${mensaje}`,
    });
    res.json({ ok: true });
  } catch (e) {
    console.error("Error enviando correo de contacto:", e.message);
    res.status(500).json({ error: "No se pudo enviar el mensaje" });
  }
});

export default router;
