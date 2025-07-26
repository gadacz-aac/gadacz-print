import { useState } from "react";
import type { FallbackProps } from "react-error-boundary";
import { useTranslation } from "react-i18next";
import styles from "./ErrorBoundaryFallback.module.css";

function ErrorBoundaryFallback({ error, resetErrorBoundary }: FallbackProps) {
  const { t } = useTranslation();
  const [showDetails, setShowDetails] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(error.stack || "");
  };

  return (
    <div className={styles.errorContainer}>
      <h1 className={styles.errorTitle}>{t("error.title")}</h1>
      <p className={styles.errorMessage}>{t("error.message")}</p>

      {showDetails && (
        <div className={styles.errorDetails}>
          <pre className={styles.errorStack}>{error.stack}</pre>
        </div>
      )}

      <div className={styles.buttonGroup}>
        <button className={styles.button} onClick={resetErrorBoundary}>
          {t("error.retry")}
        </button>
        <button
          className={styles.button}
          onClick={() => setShowDetails((prev) => !prev)}
        >
          {showDetails ? t("error.hideDetails") : t("error.showDetails")}
        </button>
        {showDetails && (
          <button className={styles.button} onClick={handleCopy}>
            {t("error.copy")}
          </button>
        )}
      </div>
    </div>
  );
}

export default ErrorBoundaryFallback;
