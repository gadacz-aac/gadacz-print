export const APP_CONTAINER_ID = "APP_CONTAINER_ID";

export const focusMainContainer = () => {
  console.log(document.querySelector<HTMLElement>("#" + APP_CONTAINER_ID));
  document.querySelector<HTMLElement>("#" + APP_CONTAINER_ID)?.focus();
};

export const isEmpty = (dupa: string | Array<unknown>) => {
  if (Array.isArray(dupa)) return dupa.length === 0;

  return dupa.trim().length === 0;
};