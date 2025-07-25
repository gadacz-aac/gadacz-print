export const APP_CONTAINER_ID = "APP_CONTAINER_ID";

export const focusMainContainer = () => {
  console.log(document.querySelector<HTMLElement>("#" + APP_CONTAINER_ID));
  document.querySelector<HTMLElement>("#" + APP_CONTAINER_ID)?.focus();
};
