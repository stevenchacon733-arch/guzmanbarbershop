const crypto = require("node:crypto");
const readline = require("node:readline");

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

rl.question("Contraseña del panel de administración: ", (password) => {
  rl.close();
  if (!password || password.length < 8) {
    console.error("\nUsá una contraseña de al menos 8 caracteres.");
    process.exitCode = 1;
    return;
  }
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  console.log("\nAgregá esta línea a tu .env.local (y a las variables de entorno de Vercel):\n");
  console.log(`ADMIN_PASSWORD_HASH=${salt}:${hash}\n`);
});
