import type { StateCreator } from "zustand";

export interface SnackbarSlice {
  snackbar: {
    message: string | null;
    open: boolean;
  };
  showSnackbar: (message: string, timeout?: number) => void;
  hideSnackbar: () => void;
}

export const createSnackbarSlice: StateCreator<
  SnackbarSlice,
  [],
  [],
  SnackbarSlice
> = (set, get) => ({
  snackbar: {
    message: null,
    open: false,
  },
  showSnackbar: (message, timeout) => {
    if (timeout) {
      setTimeout(() => get().hideSnackbar(), timeout);
    }
    set(() => ({ snackbar: { message, open: true } }));
  },
  hideSnackbar: () => set(() => ({ snackbar: { message: null, open: false } })),
});
