import resources from "./i18next_resource";

declare module "i18next" {
  interface CustomTypeOptions {
    resources: typeof resources;
  }
}
