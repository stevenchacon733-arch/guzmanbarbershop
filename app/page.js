import fs from "node:fs";
import path from "node:path";

function legacyMarkup() {
  const source = fs.readFileSync(path.join(process.cwd(), "public", "index.html"), "utf8");
  return source
    .match(/<body[^>]*>([\s\S]*)<\/body>/i)?.[1]
    .replace(/<script[^>]*src=["']app\.js["'][^>]*><\/script>/i, "") || "";
}

export default function Home() {
  return <main dangerouslySetInnerHTML={{ __html: legacyMarkup() }} />;
}