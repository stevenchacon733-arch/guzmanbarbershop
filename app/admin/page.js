import { cookies } from "next/headers";
import Script from "next/script";
import { legacyMarkup } from "../../lib/legacy";
import { SESSION_COOKIE_NAME, isValidSessionCookie } from "../../lib/auth";

export default async function AdminPage() {
  const cookieStore = await cookies();
  const authenticated = isValidSessionCookie(cookieStore.get(SESSION_COOKIE_NAME)?.value);

  return (
    <>
      {/* Leído por public/app.js para decidir si mostrar el login o el panel.
          La sesión real se valida en el servidor (cookie httpOnly firmada);
          este flag no puede falsificarse desde la consola del navegador. */}
      <div id="adminAuthFlag" data-authenticated={authenticated ? "true" : "false"} hidden />
      <main dangerouslySetInnerHTML={{ __html: legacyMarkup() }} />
      <Script id="open-admin" strategy="afterInteractive">
        {"document.getElementById('adminModal')?.classList.add('open'); document.body.classList.add('modal-open'); document.getElementById('adminModal')?.setAttribute('aria-hidden', 'false');"}
      </Script>
    </>
  );
}