<template>
  <el-dialog
    v-model="vm.visible"
    modal
    width="1248px"
    top="2vh"
    :title="vm.curFile?.filename"
  >
    <div id="fileNoteEditor"></div>
  </el-dialog>
</template>

<script setup lang="ts">
import { useEditor } from "@/hooks/editor";
import { useCommitsStore } from "@/stores/commits";
import type { ICommitFile } from "@/types";
import { nextTick, onMounted, onUpdated, reactive } from "vue";

const store = useCommitsStore();
const vm = reactive({
  title: "",
  visible: false,
  curFile: null as null | ICommitFile,
});

let preventStoreUpdate = false;

const editor = useEditor("#fileNoteEditor", {
  height: "750px",
  lazyAppend: true,
  change(content) {
    console.log(">>>change");
    if (!preventStoreUpdate) {
      store.updateFileNotes(vm.curFile?.filename!, content);
    }
  },
});

const show = (file: ICommitFile) => {
  vm.visible = true;
  vm.curFile = file;
  vm.title = file.filename;
  preventStoreUpdate = true;
  editor.setMarkdown(file?.custom?.notes || "");
  preventStoreUpdate = false;
};

defineExpose({
  show,
});
</script>

<style lang="scss" scoped></style>
