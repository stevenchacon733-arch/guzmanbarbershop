import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(request) {
  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const ownerPhone = process.env.WHATSAPP_OWNER_PHONE;

  if (!token || !phoneNumberId || !ownerPhone) {
    return NextResponse.json({ configured: false });
  }

  let appointment;
  try {
    appointment = await request.json();
  } catch {
    return NextResponse.json({ error: "Reserva inválida." }, { status: 400 });
  }

  const required = ["clientName", "phone", "serviceName", "date", "time", "barberName"];
  if (required.some((key) => !String(appointment?.[key] || "").trim())) {
    return NextResponse.json({ error: "Faltan datos de la reserva." }, { status: 400 });
  }

  const message = [
    "Nueva reserva - Guzman Barbershop",
    `Cliente: ${appointment.clientName}`,
    `Telefono: ${appointment.phone}`,
    `Servicio: ${appointment.serviceName}`,
    `Fecha: ${appointment.date}`,
    `Hora: ${appointment.time}`,
    `Barbero: ${appointment.barberName}`,
    appointment.note ? `Nota: ${appointment.note}` : null,
  ].filter(Boolean).join("\n");

  const response = await fetch(`https://graph.facebook.com/v21.0/${phoneNumberId}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: ownerPhone,
      type: "text",
      text: { preview_url: false, body: message },
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    console.error("WhatsApp notification failed", detail);
    return NextResponse.json({ configured: true, sent: false }, { status: 502 });
  }

  return NextResponse.json({ configured: true, sent: true });
}