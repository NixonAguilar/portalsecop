import { Fragment, useMemo, type ReactNode } from "react";

/** Quita tildes y pasa a minúscula para comparar sin sensibilidad a acentos. */
function normalize(s: string): string {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

/** Raíz de un token para resaltar la familia léxica (medica -> medic). */
function needle(tok: string): string {
  let s = normalize(tok).replace(/[^0-9a-zñ]/g, "");
  if (s.length > 4 && s.endsWith("s")) s = s.slice(0, -1);
  if (s.length > 4 && /[aeiou]$/.test(s)) s = s.slice(0, -1);
  return s;
}

interface HighlightProps {
  text: string;
  query: string;
}

/**
 * Resalta en el texto los términos buscados (Search Keyword Highlighting),
 * de forma insensible a mayúsculas y tildes, conservando el texto original.
 */
export function Highlight({ text, query }: HighlightProps) {
  const ranges = useMemo(() => {
    const needles = query
      .trim()
      .split(/\s+/)
      .map(needle)
      .filter((n) => n.length >= 3);
    if (needles.length === 0) return [];

    const norm = normalize(text);
    const found: Array<[number, number]> = [];
    for (const n of needles) {
      let from = 0;
      let idx = norm.indexOf(n, from);
      while (idx !== -1) {
        found.push([idx, idx + n.length]);
        from = idx + n.length;
        idx = norm.indexOf(n, from);
      }
    }
    if (found.length === 0) return [];
    // Ordenar y fusionar solapamientos.
    found.sort((a, b) => a[0] - b[0]);
    const merged: Array<[number, number]> = [found[0]];
    for (let i = 1; i < found.length; i++) {
      const last = merged[merged.length - 1];
      if (found[i][0] <= last[1]) last[1] = Math.max(last[1], found[i][1]);
      else merged.push(found[i]);
    }
    return merged;
  }, [text, query]);

  if (ranges.length === 0) return <>{text}</>;

  const parts: ReactNode[] = [];
  let cursor = 0;
  ranges.forEach(([start, end], i) => {
    if (cursor < start) parts.push(<Fragment key={`t${i}`}>{text.slice(cursor, start)}</Fragment>);
    parts.push(
      <mark key={`m${i}`} className="rounded bg-accent/15 px-0.5 font-semibold text-accent">
        {text.slice(start, end)}
      </mark>,
    );
    cursor = end;
  });
  if (cursor < text.length) parts.push(<Fragment key="tail">{text.slice(cursor)}</Fragment>);

  return <>{parts}</>;
}
