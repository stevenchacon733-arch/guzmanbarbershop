import { legacyMarkup } from "../lib/legacy";

export default function Home() {
  return <main dangerouslySetInnerHTML={{ __html: legacyMarkup() }} />;
}