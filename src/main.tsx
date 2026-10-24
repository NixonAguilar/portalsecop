import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import App from "@/App";
import { AuthProvider } from "@/providers/AuthProvider";
import { AuthUIProvider } from "@/providers/AuthUIProvider";
import { QueryProvider } from "@/providers/QueryProvider";
import "@/index.css";

const rootEl = document.getElementById("root");
if (!rootEl) throw new Error("No se encontró el elemento #root");

createRoot(rootEl).render(
  <StrictMode>
    <QueryProvider>
      <AuthProvider>
        <AuthUIProvider>
          <App />
        </AuthUIProvider>
      </AuthProvider>
    </QueryProvider>
  </StrictMode>,
);
