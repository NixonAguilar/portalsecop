import { ShieldCheck, Sparkles } from "lucide-react";

import { HeroSearch } from "@/components/HeroSearch";
import type { SourceSelection } from "@/types/secop";

interface HeroProps {
  query: string;
  source: SourceSelection;
  onQueryChange: (q: string) => void;
  onSourceChange: (s: SourceSelection) => void;
  onSubmit: () => void;
}

export function Hero(props: HeroProps) {
  return (
    <section
      id="top"
      className="relative overflow-hidden bg-primary text-primary-foreground"
    >
      {/* Fondo decorativo */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 20%, hsl(211 70% 46% / 0.5), transparent 45%), radial-gradient(circle at 85% 0%, hsl(160 70% 36% / 0.35), transparent 40%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "linear-gradient(hsl(0 0% 100%) 1px, transparent 1px), linear-gradient(90deg, hsl(0 0% 100%) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
        }}
      />

      <div className="container relative py-16 lg:py-24">
        <div className="mx-auto max-w-3xl text-center">
          <span className="mb-5 inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium backdrop-blur">
            <Sparkles className="h-3.5 w-3.5" />
            Datos oficiales en tiempo real · datos.gov.co
          </span>

          <h1 className="text-balance text-4xl font-extrabold leading-[1.1] sm:text-5xl lg:text-6xl">
            Encuentra procesos de <span className="text-emerald-300">contratación pública</span> en
            segundos
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-balance text-lg text-primary-foreground/80">
            <strong className="font-semibold text-white">Radar Público</strong> consolida SECOP I y
            SECOP II en una sola plataforma para que busques, filtres y monitorees licitaciones,
            concursos y contrataciones del Estado colombiano con datos abiertos en tiempo real.
          </p>

          <div className="mx-auto mt-9 max-w-2xl">
            <HeroSearch {...props} />
          </div>

          <div className="mt-5 flex items-center justify-center gap-2 text-sm text-primary-foreground/70">
            <ShieldCheck className="h-4 w-4 text-emerald-300" />
            <span>Información pública conforme a la Ley de Transparencia (1712 de 2014)</span>
          </div>
        </div>
      </div>
    </section>
  );
}
