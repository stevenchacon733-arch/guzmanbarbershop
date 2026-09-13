# NOIR & GOLD Barbershop — GitHub + Vercel

Web responsive de reservas para barbería premium, preparada para publicarse desde GitHub en Vercel.

## Funciones incluidas

- Landing page premium negro/café/dorado.
- Reserva en 4 pasos: servicio, fecha, barbero y hora.
- Cálculo de disponibilidad según duración del servicio.
- Evita cruces de citas.
- Panel del dueño.
- Selección de barberos activos por fecha.
- Horario semanal general editable.
- Horarios especiales por fecha.
- Gestión y cancelación de citas.
- Responsive para celular y computadora.

## Demo del panel

Contraseña temporal: `barber2026`

> Esta contraseña es solo para la demo frontend. No se debe usar así en producción.

## Subir a GitHub desde CMD / PowerShell

Abre la terminal dentro de esta carpeta y ejecuta:

```bash
git init
git add .
git commit -m "Initial barber booking website"
git branch -M main
git remote add origin https://github.com/TU-USUARIO/TU-REPOSITORIO.git
git push -u origin main
```

Si el repositorio ya fue clonado desde GitHub, normalmente solo necesitas:

```bash
git add .
git commit -m "Update barber website"
git push
```

## Publicar en Vercel

1. Entra a Vercel.
2. Add New > Project.
3. Importa el repositorio de GitHub.
4. Framework Preset: `Other`.
5. Root Directory: déjalo en la raíz del repositorio.
6. Build Command: vacío.
7. Output Directory: vacío.
8. Pulsa Deploy.

Vercel detectará `index.html` directamente.

## Actualizaciones automáticas

Después de conectar GitHub con Vercel, cada vez que hagas:

```bash
git add .
git commit -m "Cambios"
git push
```

Vercel creará automáticamente un nuevo deployment con los cambios.

## Importante: base de datos

Actualmente esta demo usa `localStorage`. Eso significa que las citas se guardan solamente en el navegador donde fueron creadas.

## Notificaciones por WhatsApp

La reserva llama a `/api/notify`, que usa WhatsApp Cloud API desde el servidor. En Vercel configura estas variables privadas:

```env
WHATSAPP_ACCESS_TOKEN=token_de_meta
WHATSAPP_PHONE_NUMBER_ID=id_del_numero_de_whatsapp
WHATSAPP_OWNER_PHONE=506XXXXXXXX
```

El número debe estar en formato internacional, sin `+`, espacios ni guiones. Crea una app de WhatsApp Business en Meta, agrega el número de prueba o producción y copia su token permanente y Phone Number ID. Sin estas variables, la reserva se guarda localmente pero no se envía ninguna notificación.

Para producción hay que conectar una base de datos central (recomendado: Supabase) para que:

- una cita creada por un cliente aparezca en el panel del dueño;
- varios clientes compartan la misma disponibilidad;
- el dueño pueda entrar desde cualquier dispositivo;
- exista autenticación real y segura;
- los horarios y barberos se guarden centralmente.

La estructura de esta versión está lista para publicarse primero en Vercel y después migrar la persistencia a Supabase.

## Archivos

```text
index.html
styles.css
app.js
vercel.json
.gitignore
README.md
```
