import { defineStore } from "pinia";
import type { ICommitItem } from "./../types/index";

const STORAGE_KEY = "COMMIT_NOTES";

export const useCommitsStore = defineStore({
  id: "commitStore",
  state: () => ({
    curItem: null as ICommitItem | null,
    commitNotesMap: JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}"),
  }),
  getters: {},
  actions: {
    setCurItem(item: ICommitItem) {
      this.curItem = item;
    },
    updateNote(content: string) {
      if (!this.curItem) throw new Error("item should be seleced");
      this.commitNotesMap[this.curItem.sha] = { content, date: Date.now() };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.commitNotesMap));
    },
  },
});
