import { searchTerms } from "../../lib/search";

export function SearchHighlight({ text, query }: { text: string; query: string }) {
  const terms = searchTerms(query).sort((a, b) => b.length - a.length);
  if (!terms.length) return <>{text}</>;
  const pattern = terms.map((term) => term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|");
  return <>{text.split(new RegExp(`(${pattern})`, "gi")).map((part, index) =>
    index % 2 ? <mark key={index} className="rounded-sm bg-cyan-400/15 text-cyan-200">{part}</mark> : part)}</>;
}
