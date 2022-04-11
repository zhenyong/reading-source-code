<script setup lang="ts">
import { useEditor } from "@/hooks/editor";
import { useTree } from "@/hooks/tree";
import { useFileTreeStore } from "@/stores/fileTree";
import { file } from "@babel/types";
import { Upload } from "@element-plus/icons-vue";
import type { TreeNodeData } from "element-plus/lib/components/tree/src/tree.type";
import { computed, onMounted, ref, watch } from "vue";
import { debounce } from "lodash";
import Commits from "@/components/Commits.vue";
import type { ICommitItem } from "@/types";
import { useCommitsStore } from "@/stores/commits";
import copy from "clipboard-copy";
import CommitFilesTree from "../components/CommitFilesTree.vue";

const store = useCommitsStore();

let canStoreUpdateNote = true;

const editor = useEditor("#editor", {
  lazyAppend: true,
  initialValueFn: () => "",
  change(content) {
    if (canStoreUpdateNote) {
      store.updateNote(content);
    }
  },
});

const handleItemClick = (item: ICommitItem, e?: MouseEvent) => {
  console.log(">>>handleItemClick", item, e);
  /**
   * 每次点击后再去加载该提交对应的文件信息
   */
  store.setCurItem(item);
  store.pullCommitFilesInfo(item);
  canStoreUpdateNote = false;
  editor.setMarkdown(store.commitInfoMap[item.sha]?.content || "", false);
  canStoreUpdateNote = true;
  try {
    copy(item.sha);
  } catch (e) {}
};

if (store.curItem) {
  handleItemClick(store.curItem);
}

const editorVisible = true; //computed(() => Boolean(fileTreeStore.curNode))
</script>

<template>
  <main>
    <div class="left-pane">
      <Commits @click="handleItemClick" />
      <CommitFilesTree />
    </div>
    <div class="content-pane">
      <div class="h-wrap">
        <el-button class="btn-push" size="small" type="primary" :icon="Upload"
          >Push State</el-button
        >
      </div>
      <div class="editor-wrap">
        <div :hidden="!editorVisible" id="editor"></div>
      </div>
    </div>
  </main>
</template>

<style scope lang="scss">
main {
  display: flex;
  margin: 0 auto;
}
.left-pane {
  display: flex;
  flex-direction: column;
}
.editor-wrap {
  border: 1px solid red;
  width: 1200px;
  margin-top: 16px;
  flex: 1;
  #editor {
    width: 100%;
    height: 100%;
  }
}
.btn-push {
  display: inline-flex;
  width: 100px;
  align-self: flex-end;
}
.content-pane {
  display: flex;
  flex-direction: column;
  margin-left: 28px;
  .h-wrap {
    display: flex;
    justify-content: space-between;
  }
}
</style>
