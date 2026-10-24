import { CheckCircle2, Loader2, Lock, Mail, Radar, User as UserIcon } from "lucide-react";
import { useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogDescription,
  DialogModalContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

type Mode = "login" | "register";

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialMode?: Mode;
}

export function AuthModal({ open, onOpenChange, initialMode = "login" }: AuthModalProps) {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<Mode>(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  function reset() {
    setError(null);
    setSuccess(null);
    setLoading(false);
  }

  function switchMode(next: Mode) {
    reset();
    setMode(next);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    reset();
    setLoading(true);

    const result =
      mode === "login"
        ? await signIn({ email, password })
        : await signUp({ email, password, fullName });

    setLoading(false);

    if (!result.ok) {
      setError(result.error ?? "No se pudo completar la operación.");
      return;
    }

    if (mode === "register" && result.needsEmailConfirmation) {
      setSuccess("¡Cuenta creada! Revisa tu correo para confirmar antes de iniciar sesión.");
      return;
    }

    // Éxito con sesión activa: cerrar modal.
    onOpenChange(false);
    setEmail("");
    setPassword("");
    setFullName("");
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogModalContent>
        <div className="flex flex-col items-center text-center">
          <span className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-primary-foreground ring-1 ring-accent/30">
            <Radar className="h-6 w-6 text-accent" />
          </span>
          <DialogTitle className="text-xl">
            {mode === "login" ? "Inicia sesión" : "Crea tu cuenta"}
          </DialogTitle>
          <DialogDescription className="mt-1">
            {mode === "login"
              ? "Accede a Radar Público para guardar búsquedas y alertas."
              : "Regístrate para monitorear procesos de contratación pública."}
          </DialogDescription>
        </div>

        {/* Selector de modo */}
        <div className="grid grid-cols-2 gap-1 rounded-lg bg-secondary p-1">
          {(["login", "register"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => switchMode(m)}
              className={cn(
                "rounded-md py-1.5 text-sm font-semibold transition-colors",
                mode === m
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {m === "login" ? "Entrar" : "Registrarse"}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {mode === "register" && (
            <div className="space-y-1">
              <Label htmlFor="auth-name">Nombre completo</Label>
              <div className="relative">
                <UserIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="auth-name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Tu nombre"
                  className="pl-9"
                  autoComplete="name"
                />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <Label htmlFor="auth-email">Correo electrónico</Label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="auth-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tucorreo@ejemplo.com"
                className="pl-9"
                autoComplete="email"
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="auth-password">Contraseña</Label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="auth-password"
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                className="pl-9"
                autoComplete={mode === "login" ? "current-password" : "new-password"}
              />
            </div>
          </div>

          {error && (
            <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive" role="alert">
              {error}
            </p>
          )}
          {success && (
            <p className="flex items-start gap-2 rounded-md bg-success/10 px-3 py-2 text-sm text-success">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
              {success}
            </p>
          )}

          <Button type="submit" variant="accent" size="lg" className="w-full" disabled={loading}>
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {mode === "login" ? "Entrar" : "Crear cuenta"}
          </Button>
        </form>

        <p className="text-center text-xs text-muted-foreground">
          {mode === "login" ? "¿No tienes cuenta? " : "¿Ya tienes cuenta? "}
          <button
            type="button"
            onClick={() => switchMode(mode === "login" ? "register" : "login")}
            className="font-semibold text-accent hover:underline"
          >
            {mode === "login" ? "Regístrate" : "Inicia sesión"}
          </button>
        </p>
      </DialogModalContent>
    </Dialog>
  );
}
