import { withBase } from "ufo";

export function useAssetPath() {
  const config = useRuntimeConfig();

  return (path: string) => {
    const normalizedPath = path.startsWith("/") ? path : `/${path}`;
    return withBase(normalizedPath, config.app.baseURL);
  };
}
