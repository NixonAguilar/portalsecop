import { FileSearch } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border bg-primary text-primary-foreground">
      <div className="container grid gap-8 py-12 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10">
              <FileSearch className="h-5 w-5" />
            </span>
            <span className="text-base font-extrabold">Portal de Contratación</span>
          </div>
          <p className="mt-3 max-w-md text-sm text-primary-foreground/70">
            Motor de búsqueda de procesos de contratación pública en Colombia. Consolida SECOP I y
            SECOP II a partir de la API de Datos Abiertos del Estado colombiano.
          </p>
        </div>

        <div>
          <h3 className="text-sm font-semibold">Fuentes</h3>
          <ul className="mt-3 space-y-2 text-sm text-primary-foreground/70">
            <li>
              <a
                href="https://www.datos.gov.co/resource/p6dx-8zbt"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white hover:underline"
              >
                Dataset SECOP II
              </a>
            </li>
            <li>
              <a
                href="https://www.datos.gov.co/resource/f789-7hwg"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white hover:underline"
              >
                Dataset SECOP I
              </a>
            </li>
            <li>
              <a
                href="https://www.colombiacompra.gov.co/secop"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white hover:underline"
              >
                Colombia Compra Eficiente
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold">Cumplimiento</h3>
          <ul className="mt-3 space-y-2 text-sm text-primary-foreground/70">
            <li>Ley 1712 de 2014 (Transparencia)</li>
            <li>Datos Abiertos Colombia</li>
            <li>Uso informativo no oficial</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container flex flex-col items-center justify-between gap-2 py-5 text-xs text-primary-foreground/60 sm:flex-row">
          <span>© {new Date().getFullYear()} Portal de Contratación. Datos de dominio público.</span>
          <span>
            Fuente oficial:{" "}
            <a
              href="https://www.datos.gov.co"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-primary-foreground/80 hover:text-white hover:underline"
            >
              datos.gov.co
            </a>
          </span>
        </div>
      </div>
    </footer>
  );
}
