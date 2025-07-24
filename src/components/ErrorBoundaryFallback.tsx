import type { FallbackProps } from "react-error-boundary";
import styles from "./ErrorBoundaryFallback.module.css";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";

function ErrorBoundaryFallback({ error, resetErrorBoundary }: FallbackProps) {
  const { t } = useTranslation();
  const [showDetails, setShowDetails] = useState(false);
  const [typedCommand, setTypedCommand] = useState("");
  const rebootCommand = "reboot";

  useEffect(() => {
    console.error(error);
    const timer = setTimeout(() => {
      // Simulate typing the command
      for (let i = 0; i < rebootCommand.length; i++) {
        setTimeout(() => {
          setTypedCommand(rebootCommand.substring(0, i + 1));
        }, i * 150);
      }
      // After typing, wait a bit and then reset
      setTimeout(resetErrorBoundary, rebootCommand.length * 150 + 500);
    }, 2000); // Start typing after 2 seconds

    return () => clearTimeout(timer);
  }, [error, resetErrorBoundary]);


  return (
    <div role="alert" className={styles.container}>
      <div className={styles.glitchWrapper}>
        <div className={styles.glitch} data-text="SYSTEM FAILURE">SYSTEM FAILURE</div>
      </div>
      <div className={styles.terminal}>
        <p className={styles.terminalText}>
          {t("error.title")}
        </p>
        <p className={styles.terminalText}>
          {t("error.message")}
        </p>
        <p className={styles.terminalText}>
          <button className={styles.detailsButton} onClick={() => setShowDetails(!showDetails)}>
            {showDetails ? t("error.hideDetails") : t("error.showDetails")}
          </button>
        </p>
        {showDetails && (
          <pre className={styles.errorDetails}>{error.message}</pre>
        )}
        <p className={styles.terminalText}>
          {t("error.rebooting")}
        </p>
        <div className={styles.commandLine}>
          <span className={styles.prompt}>&gt;</span>
          <span className={styles.typedCommand}>{typedCommand}</span>
          <span className={styles.cursor}>_</span>
        </div>
      </div>
    </div>
  );
}

export default ErrorBoundaryFallback;