import Script from "next/script";

export const metadata = {
  title: "Guzman Barber Shop | Reservas",
  description: "Reserva tu cita en Guzman Barber Shop."
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