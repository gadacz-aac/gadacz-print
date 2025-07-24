import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import "./i18n"; // Import i18n configuration
import { I18nextProvider } from "react-i18next";
import i18n from "./i18n";
import { ErrorBoundary } from "react-error-boundary";
import ErrorBoundaryFallback from "./components/ErrorBoundaryFallback.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <I18nextProvider i18n={i18n}>
      <ErrorBoundary FallbackComponent={ErrorBoundaryFallback}>
        <App />
      </ErrorBoundary>
    </I18nextProvider>
  </StrictMode>,
);
