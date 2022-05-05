export * from "./github";
import config from "../../config.json";

export const isIgnoreFilename = (filename: string) => {
  return config.excludes.includes(filename.split("/").pop()!);
};
