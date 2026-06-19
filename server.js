import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Servir la carpeta dist generada por vite build
app.use(express.static(path.join(__dirname, "dist")));

// Servir archivos estáticos de dist
app.use(express.static(path.join(__dirname, "dist")));

// Capturar cualquier ruta y devolver index.html
app.use((req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});


app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
