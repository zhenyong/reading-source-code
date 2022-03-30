<script setup lang="ts">
import { useEditor } from "@/hooks/editor";
import { useTree } from "@/hooks/tree";
import { useFileTreeStore } from "@/stores/fileTree";
import { file } from "@babel/types";
import { Upload } from "@element-plus/icons-vue";
import type { TreeNodeData } from "element-plus/lib/components/tree/src/tree.type";
import { computed, onMounted, ref, watchEffect } from "vue";

const fileTreeStore = useFileTreeStore();

const editor = useEditor("editor", () => fileTreeStore.curNode?.notes || "");

const loading = ref(false);
const curNodeId = ref("");

const handleCheckChange = async (
  data: TreeNodeData,
  checked: boolean,
  indeterminate: boolean // 是否半选
) => {
  loading.value = true;
  await fileTreeStore.toggleCheck(data.path, checked);
  loading.value = false;
};

// TODO 现在每个操作都会计算 flattenItems，保证数据初始化后只需要算一遍
const defaultCheckedKeys = computed(() => {
  return fileTreeStore.flattenItems
    .filter((item) => {
      return item.status === "done";
    })
    .map((item) => item.path);
});

const handleNodeClick = (data: TreeNodeData) => fileTreeStore.activeNode(data);
const hanldeTextChange = (e: Event) => {
  fileTreeStore.updateCurNodeNotes((e.target as HTMLTextAreaElement).value);
};

const { vm, handleNodeExpand, handleNodeCollapse } = useTree();

watchEffect(() => {
  const notes = fileTreeStore.curNode?.notes || "";
  editor.setMarkdown(notes);
});
</script>

<template>
  <main>
    <el-tree
      :default-expanded-keys="vm.expandedKeys"
      :default-checked-keys="defaultCheckedKeys"
      v-loading="loading"
      @check-change="handleCheckChange"
      @node-click="handleNodeClick"
      @node-expand="handleNodeExpand"
      @node-collapse="handleNodeCollapse"
      :props="{ disabled: 'dir' }"
      node-key="path"
      :data="(fileTreeStore.tree as any)"
      show-checkbox
    />
    <div class="content-pane">
      <div class="h-wrap">
        <div>{{ fileTreeStore.curNode?.path }}</div>
        <el-button
          class="btn-push"
          size="small"
          type="primary"
          :icon="Upload"
          :loading="fileTreeStore.pushStatePending"
        >Push State</el-button>
      </div>
      <div id="editor"></div>
      <!-- <textarea
        @change="hanldeTextChange"
        :value="fileTreeStore.curNode?.notes"
      />-->
    </div>
  </main>
</template>

<style scope lang="scss">
main {
  display: flex;
}
#editor {
  border: 1px solid red;
  width: 720px;
  margin-top: 16px;
  flex: 1;
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
