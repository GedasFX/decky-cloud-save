import { ServerAPI } from "decky-frontend-lib";

declare module "*.svg" {
  const content: string;
  export default content;
}

declare module "*.png" {
  const content: string;
  export default content;
}

declare module "*.jpg" {
  const content: string;
  export default content;
}

export type PageProps<T> = {
  serverApi: ServerAPI;
} & T;
