//@ts-ignore
import GitHub from "github-api";

export * from "./gist";
import fs from "fs";
const gh = new GitHub({
  token: "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",
});

let repo = gh.getRepo("vuejs", "core");

export const getSingleCommit = (sha: string) => repo.getSingleCommit(sha);
