import { getSingleCommit, GIST_FILES, pushGist } from "@/api";
import { throttle } from "lodash";
import { defineStore } from "pinia";
import type { ICommitItem } from "./../types/index";

interface ICommitFile {
  sha: string;
  filename: string;
  status: string;
  additions: number;
  deletions: number;
  changes: number;
  blob_url: string;
  raw_url: string;
  contents_url: string;
  patch: string;
}

const throttlePushStatePerHalfMin = throttle(
  pushGist.bind(null, GIST_FILES.COMMITS),
  30 * 1000,
  {
    leading: true,
    trailing: true,
  }
);

const STORAGE_KEY = "COMMIT_INFOS";
const STORAGE_KEY_LAST_SELECTED_ITEM = "LAST_SELECTED_COMMIT";

const commitInfoMap: Record<
  string,
  { content: string; date: number; files?: ICommitFile[] }
> = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
const localStorageCurItem = localStorage.getItem(
  STORAGE_KEY_LAST_SELECTED_ITEM
);

export const _useCommitsStore = defineStore({
  id: "commitStore",
  state: () => ({
    commitInfoMap,
    curItem: (localStorageCurItem
      ? JSON.parse(localStorageCurItem)
      : null) as ICommitItem | null,
  }),
  getters: {},
  actions: {
    setCurItem(item: ICommitItem) {
      this.curItem = item;
      localStorage.setItem(
        STORAGE_KEY_LAST_SELECTED_ITEM,
        JSON.stringify(item)
      );
    },
    save() {
      const strCommitInfoMap = JSON.stringify(this.commitInfoMap);
      localStorage.setItem(STORAGE_KEY, strCommitInfoMap);
      throttlePushStatePerHalfMin(strCommitInfoMap);
    },
    updateNote(content: string) {
      if (!this.curItem) throw new Error("item should be seleced");
      this.commitInfoMap[this.curItem.sha] = {
        content,
        date: Date.now(),
      };
      this.save();
    },
    async pullCommitFilesInfo(item: ICommitItem) {
      if (!this.commitInfoMap[item.sha]?.files) {
        const { data } = await getSingleCommit(item.sha);
        this.commitInfoMap[item.sha].files = data.files;
        this.save();
      }
    },
  },
});

export const useCommitsStore = () => {
  const store = _useCommitsStore();
  return store;
};
