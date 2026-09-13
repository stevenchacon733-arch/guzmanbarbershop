import Script from "next/script";

export const metadata = {
  title: "NOIR & GOLD Barbershop | Reservas",
  description: "Reserva tu cita en NOIR & GOLD Barbershop."
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <head>
        <link rel="stylesheet" href="/styles.css" />
      </head>
      <body>
        {children}
        <Script src="/app.js" strategy="afterInteractive" />
      </body>
    </html>
  );
}