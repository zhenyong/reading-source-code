import { getSingleCommit, GIST_FILES, pushGist } from "@/api";
import { isIgnoreFilename } from "@/utils";
import { throttle } from "lodash";
import { defineStore } from "pinia";
import { isReactive } from "vue";
import type { ICommitItem, ICommitFile } from "./../types/index";

const throttlePushStatePerHalfMin = throttle(
  (content, cb) => {
    pushGist.apply(null, [GIST_FILES.COMMITS, content]);
    cb && cb();
  },
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

export const useCommitsStore = defineStore({
  id: "commitStore",
  state: () => ({
    pushing: false,
    commitInfoMap,
    pushSuccessCount: 0,
    curItem: (localStorageCurItem
      ? JSON.parse(localStorageCurItem)
      : null) as ICommitItem | null,
  }),
  getters: {
    curFiles: (state) => {
      const sha = state.curItem?.sha;
      if (sha) {
        return state.commitInfoMap[sha]?.files?.filter((item) =>
          isIgnoreFilename(item.filename)
        );
      }
      return null;
    },
    doneFiles: (state) => {
      const sha = state.curItem?.sha;
      if (sha) {
        return state.commitInfoMap[sha]?.files?.filter(
          (item) =>
            isIgnoreFilename(item.filename) && item.custom?.status === "done"
        );
      }
      return null;
    },
    numOfCompleted: (state) => {
      return (
        Object.entries(state.commitInfoMap).filter(([sha, map]) => {
          return map.files?.every((file) => {
            if (isIgnoreFilename(file.filename)) return true;
            return file?.custom?.status === "done";
          });
        })?.length || 0
      );
    },
  },
  actions: {
    setCurItem(item: ICommitItem) {
      console.log(">>>setCurItem");
      this.curItem = item;
      this.commitInfoMap[item.sha] = this.commitInfoMap[item.sha] || {};
      localStorage.setItem(
        STORAGE_KEY_LAST_SELECTED_ITEM,
        JSON.stringify(item)
      );
    },
    async save() {
      const strCommitInfoMap = JSON.stringify(this.commitInfoMap);
      localStorage.setItem(STORAGE_KEY, strCommitInfoMap);
      this.pushing = true;
      try {
        await throttlePushStatePerHalfMin(strCommitInfoMap, () => {
          this.pushSuccessCount += 1;
        });
      } catch (e) {
      } finally {
        this.pushing = false;
      }
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
      fileItem.custom = fileItem.custom || {};
      (fileItem.custom.status = checked ? "done" : "undo"),
        console.log(">>>toggleCheck", path, checked);
      this.save();
    },
    updateFileNotes(filePath: string, content: string) {
      const fileItem = this.commitInfoMap[this.curItem!.sha].files?.find(
        ({ filename }) => filename === filePath
      );
      if (!fileItem) throw new Error(`file with path ${filePath} not exist!`);
      fileItem.custom = fileItem.custom || {};
      fileItem.custom.notes = content;
      this.save();
    },
  },
});
