import { getSingleCommit, GIST_FILES, pushGist } from "@/api";
import { throttle } from "lodash";
import { defineStore } from "pinia";
import { isReactive } from "vue";
import type { ICommitItem, ICommitFile } from "./../types/index";

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

console.log("init load commitInfoMap", commitInfoMap);

export const _useCommitsStore = defineStore({
  id: "commitStore",
  state: () => ({
    commitInfoMap,
    curItem: (localStorageCurItem
      ? JSON.parse(localStorageCurItem)
      : null) as ICommitItem | null,
  }),
  getters: {
    curFiles: (state) => {
      const sha = state.curItem?.sha;
      if (sha) {
        return state.commitInfoMap[sha].files;
      }
      return null;
    },
  },
  actions: {
    setCurItem(item: ICommitItem) {
      console.log(">>>setCurItem");
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
      console.log(">>>updateNot");
      if (!this.curItem) throw new Error("item should be seleced");
      this.commitInfoMap[this.curItem.sha] = {
        ...this.commitInfoMap[this.curItem.sha],
        content,
        date: Date.now(),
      };
      this.save();
    },
    async pullCommitFilesInfo(item: ICommitItem) {
      console.log(
        ">>>pullCommitFilesInfo",
        item.sha,
        this.commitInfoMap[item.sha]?.files
      );
      if (!this.commitInfoMap[item.sha]?.files) {
        console.log(">>>fetch coimmit files");
        const { data } = await getSingleCommit(item.sha);
        this.commitInfoMap[item.sha].files = data.files;
        this.save();
      }
    },
    toggleCheck(path: string, checked: boolean) {
      // 进入方法可能是父节点，我们实际只针对子节点路径去操作
      const fileItem = this.commitInfoMap[this.curItem!.sha].files?.find(
        ({ filename }) => filename === path
      );
      if (!fileItem) throw new Error(`file with path ${path} not exist!`);
      Object.assign(fileItem, {
        custom: {
          status: checked ? "done" : "undo",
        },
      });
      console.log(">>>toggleCheck", path, checked);
      this.save();
    },
  },
});

export const useCommitsStore = () => {
  const store = _useCommitsStore();
  return store;
};
