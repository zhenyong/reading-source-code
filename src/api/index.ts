//@ts-ignore
import GitHub from "github-api";

export * from "./gist";
import fs from "fs";
const gh = new GitHub({
  token: "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",
});

let repo = gh.getRepo("vuejs", "core");

export const getSingleCommit = (sha: string) => repo.getSingleCommit(sha);
