// @ts-ignore
import GitHub from "github-api";
export const gh = new GitHub({
  token: "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",
});

export enum GIST_FILES {
  FILE_TREE = "reading-vue3-src-tree.json",
  COMMITS = "reading-vue3-commits.md",
}
const gist = gh.getGist("9c2ac99ea929088fee17a42731767685"); // not a gist yet

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

export const getGist = (name: GIST_FILES) => {
  const newGist = {
    files: {
      [name]: {},
    },
  };
  return gist
    .read()
    .then((resp: any) => {
      const files = resp?.data?.files;
      return files && files[name] ? JSON.parse(files[name]) : {};
    })
    .catch(console.error);
};
