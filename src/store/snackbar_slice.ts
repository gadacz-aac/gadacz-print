import type { StateCreator } from "zustand";

export interface SnackbarSlice {
  snackbar: {
    message: string | null;
    open: boolean;
  };
  showSnackbar: (message: string) => void;
  hideSnackbar: () => void;
}

export const createSnackbarSlice: StateCreator<
  SnackbarSlice,
  [],
  [],
  SnackbarSlice
> = (set) => ({
  snackbar: {
    message: null,
    open: false,
  },
  showSnackbar: (message) => set(() => ({ snackbar: { message, open: true } })),
  hideSnackbar: () => set(() => ({ snackbar: { message: null, open: false } })),
});
