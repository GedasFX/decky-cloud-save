import { AppDetails, ServerAPI } from "decky-frontend-lib";

/**
 * Represents the content of an SVG file.
 */
declare module "*.svg" {
  const content: string;
  export default content;
}

/**
 * Represents the content of a PNG file.
 */
declare module "*.png" {
  const content: string;
  export default content;
}

/**
 * Represents the content of a JPG file.
 */
declare module "*.jpg" {
  const content: string;
  export default content;
}

/**
 * Represents the properties of a page.
 * @typeparam T - The type of additional properties.
 */
export type PageProps<T> = {
  serverApi: ServerAPI;
} & T;
