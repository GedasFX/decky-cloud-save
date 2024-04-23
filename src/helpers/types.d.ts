import { AppDetails, ServerAPI } from "decky-frontend-lib";

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

export type AppDetailsStore = {
  GetAppDetails: (appId: number) => AppDetails | undefined;
  RequestAppDetails(appId: number): Promise<void>;
};