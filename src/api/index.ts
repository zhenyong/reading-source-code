//@ts-ignore
import GitHub from "github-api";

export * from "./gist";
import fs from "fs";
const gh = new GitHub({
  token: "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",
});

let repo = gh.getRepo("vuejs", "core");

export const getSingleCommit = (sha: string) => repo.getSingleCommit(sha);
