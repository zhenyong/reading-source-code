//@ts-ignore
import GitHub from "github-api";
import json from "../../config.json";

export const github = new GitHub({
  token: json.githubToken,
});
