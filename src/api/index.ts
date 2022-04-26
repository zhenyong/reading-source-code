import { github } from "./../utils";
//@ts-ignore
import GitHub from "github-api";

export * from "./gist";

let repo = github.getRepo("vuejs", "core");

export const getSingleCommit = (sha: string) => repo.getSingleCommit(sha);
