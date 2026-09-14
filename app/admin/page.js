import Script from "next/script";
import { legacyMarkup } from "../../lib/legacy";

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