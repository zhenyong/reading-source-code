// @ts-ignore
import GitHub from "github-api";

export const pushStateToRemote = (str: string) => {
  const gh = new GitHub({ token: "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" });
  let gist = gh.getGist("58b7b0a653c38db17ef2e05aa7b2cbe8"); // not a gist yet
  const newGist = {
    files: {
      "reading-vue3-src-tree.json": {
        content: str,
      },
    },
  };
  return gist
    .update(newGist)
    .then(() => {
      console.log("success");
    })
    .catch(console.error);
};
