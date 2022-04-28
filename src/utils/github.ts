//@ts-ignore
import GitHub from "github-api";
import json from "../../private-config.json";

export const github = new GitHub({
  token: json.githubToken,
});
