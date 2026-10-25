import { Check, Copy } from "lucide-react";
import { useState, type MouseEvent, type ReactNode } from "react";

import { cn } from "@/lib/utils";

interface CopyButtonProps {
  value: string;
  /** Etiqueta accesible / tooltip. */
  label?: string;
  /** Texto visible opcional junto al ícono. */
  children?: ReactNode;
  className?: string;
}

/** Botón de copiar al portapapeles con feedback "¡Copiado!" (CPUX: feedback inmediato). */
export function CopyButton({ value, label = "Copiar", children, className }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy(e: MouseEvent) {
    e.stopPropagation();
    e.preventDefault();
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      // Fallback para contextos sin Clipboard API.
      const ta = document.createElement("textarea");
      ta.value = value;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand("copy");
      } catch {
        /* no-op */
      }
      document.body.removeChild(ta);
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      title={copied ? "¡Copiado!" : label}
      aria-label={copied ? "¡Copiado!" : label}
      className={cn(
        "inline-flex items-center gap-1 rounded-md text-xs font-medium transition-colors",
        copied ? "text-success" : "text-muted-foreground hover:text-accent",
        className,
      )}
    >
      {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
      {children}
      {copied && <span className="text-success">¡Copiado!</span>}
    </button>
  );
}
