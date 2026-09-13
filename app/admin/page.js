import Script from "next/script";
import fs from "node:fs";
import path from "node:path";

function legacyMarkup() {
  const source = fs.readFileSync(path.join(process.cwd(), "public", "index.html"), "utf8");
  return source
    .match(/<body[^>]*>([\s\S]*)<\/body>/i)?.[1]
    .replace(/<script[^>]*src=["']app\.js["'][^>]*><\/script>/i, "") || "";
}

export default function AdminPage() {
  return (
    <>
      <main dangerouslySetInnerHTML={{ __html: legacyMarkup() }} />
      <Script id="open-admin" strategy="afterInteractive">
        {"document.getElementById('adminModal')?.classList.add('open'); document.body.classList.add('modal-open'); document.getElementById('adminModal')?.setAttribute('aria-hidden', 'false');"}
      </Script>
    </>
  );
}