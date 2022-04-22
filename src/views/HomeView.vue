<script setup lang="ts">
import { useEditor } from "@/hooks/editor";
import { useTree } from "@/hooks/tree";
import { useFileTreeStore } from "@/stores/fileTree";
import { file } from "@babel/types";
import { Upload } from "@element-plus/icons-vue";
import type { TreeNodeData } from "element-plus/lib/components/tree/src/tree.type";
import { computed, onMounted, ref, watch } from "vue";
import { debounce } from "lodash";

const fileTreeStore = useFileTreeStore();

const updateCurNodeNotes = debounce(fileTreeStore.updateCurNodeNotes, 500);
const editor = useEditor("#editor", {
  lazyAppend: true,
  initialValueFn: () => fileTreeStore.curNode?.notes || "",
  change(content) {
    updateCurNodeNotes(content);
  },
});

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

const editorVisible = computed(() => Boolean(fileTreeStore.curNode));

const handleNodeClick = (data: TreeNodeData) => {
  fileTreeStore.activeNode(data);
  editor.setMarkdown(data?.notes || "");
};
const { vm, handleNodeExpand, handleNodeCollapse } = useTree();

const unwatch = watch(
  () => fileTreeStore.curNode?.notes,
  (value, oldValue) => {
    if (!oldValue && value) {
      editor.setMarkdown(fileTreeStore.curNode?.notes || "");
      unwatch();
    }
  }
);
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
          >Push State</el-button
        >
      </div>
      <div class="editor-wrap">
        <div :hidden="!editorVisible" id="editor"></div>
      </div>
      <!-- <textarea
        @change="hanldeTextChange"
        :value="fileTreeStore.curNode?.notes"
      />-->
    </div>
  </main>
</template>

<style scoped lang="scss">
main {
  display: flex;
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
