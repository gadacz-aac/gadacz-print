import { type StateCreator } from "zustand";
import { type AppStore } from "./store";

type ZustandStateCreator = StateCreator<AppStore, [["zustand/devtools", never]]>;

export const historyMiddleware =
  (config: ZustandStateCreator): ZustandStateCreator =>
  (set, get, api) => {
    return config(
      (partial, replace, action) => {
        const actionName =
          typeof action === "string" ? action : (action as any)?.type;

        const ignoreActions = ["history/", "selection/"];
        if (actionName && ignoreActions.some((prefix) => actionName.startsWith(prefix))) {
          return set(partial, replace, action);
        }

        const { elements, numberOfPages } = get();
        const previousState = { elements, numberOfPages };

        set(partial, replace, action);

        const newElements = get().elements;
        const newNumberOfPages = get().numberOfPages;

        if (
          previousState.elements !== newElements ||
          previousState.numberOfPages !== newNumberOfPages
        ) {
          set(
            {
              past: [...get().past, previousState],
              future: [],
            },
            false,
            "history/push",
          );
        }
      },
      get,
      api,
    );
  };
