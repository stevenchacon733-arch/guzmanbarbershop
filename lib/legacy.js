import fs from "node:fs";
import path from "node:path";

// El markup de la app vive una sola vez en app/content/index.html y se
// inyecta desde las páginas de Next. Extrae el <body> y quita el <script>
// de app.js (que se carga con next/script en el layout).
export function legacyMarkup() {
  const source = fs.readFileSync(
    path.join(process.cwd(), "app", "content", "index.html"),
    "utf8"
  );
  return (
    source
      .match(/<body[^>]*>([\s\S]*)<\/body>/i)?.[1]
      .replace(/<script[^>]*src=["']app\.js["'][^>]*><\/script>/i, "") || ""
  );
}
