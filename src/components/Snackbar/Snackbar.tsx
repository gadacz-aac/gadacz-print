
import React from 'react';
import styles from './Snackbar.module.css';

interface SnackbarProps {
  message: string;
  onClose: () => void;
}

const Snackbar: React.FC<SnackbarProps> = ({ message, onClose }) => {
  return (
    <div className={styles.snackbar}>
      <div className={styles.message}>{message}</div>
      <button className={styles.closeButton} onClick={onClose}>
        &times;
      </button>
    </div>
  );
};

export default Snackbar;
