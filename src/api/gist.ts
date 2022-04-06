// @ts-ignore
import GitHub from "github-api";
export const gh = new GitHub({
  token: "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",
});

export enum GIST_FILES {
  FILE_TREE = "reading-vue3-src-tree.json",
  COMMITS = "reading-vue3-commits.md",
}
const gist = gh.getGist("1425e1123a56fc325c002da12eef6c67"); // not a gist yet

export const pushGist = (name: GIST_FILES, content: string) => {
  const newGist = {
    files: {
      [name]: { content },
    },
  };
  return gist
    .update(newGist)
    .then(() => {
      console.log("push gist success");
    })
    .catch(console.error);
};

export const getGist = (name: GIST_FILES, content: string) => {
  const newGist = {
    files: {
      [name]: { content },
    },
  };
  return gist
    .read(newGist)
    .then(() => {
      console.log("read gist success");
    })
    .catch(console.error);
};
