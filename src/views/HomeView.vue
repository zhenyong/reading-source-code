<script setup lang="ts">
import { useFileTreeStore } from "@/stores/fileTree";
import type { TreeNodeData } from "element-plus/lib/components/tree-v2/src/types";
import { computed, ref, toRaw, watch, watchEffect } from "vue";
const fileTreeStore = useFileTreeStore();

const loading = ref(false);
const curNodeId = ref("");

const handleCheckChange = async (
  data: TreeNodeData,
  checked: boolean,
  indeterminate: boolean
) => {
  loading.value = true;
  await fileTreeStore.toggleCheck(data, checked);
  loading.value = false;
};

const defaultCheckedKeys = computed(() =>
  fileTreeStore.flattenItems
    .filter((item) => item.status === "done")
    .map((item) => item.path)
);

const handleNodeClick = (data: TreeNodeData) => fileTreeStore.activeNode(data);
const hanldeTextChange = (e: Event) => {
  fileTreeStore.updateCurNodeNotes((e.target as HTMLTextAreaElement).value);
};
</script>

<template>
  <main>
    <el-tree
      :default-checked-keys="defaultCheckedKeys"
      v-loading="loading"
      @check-change="handleCheckChange"
      @node-click="handleNodeClick"
      :props="{ disabled: 'dir' }"
      node-key="path"
      :data="(fileTreeStore.tree as any)"
      show-checkbox
    />
    <div class="content-pane">
      <div>{{ fileTreeStore.curNode?.path }}</div>
      <textarea
        @change="hanldeTextChange"
        :value="fileTreeStore.curNode?.notes"
      />
    </div>
  </main>
</template>

<style scope lang="scss">
main {
  display: flex;
}
.content-pane {
  display: flex;
  flex-direction: column;
  margin-left: 28px;

  textarea {
    margin-top: 16px;
    width: 640px;
    border: 1px solid #eee;
    flex: 1;
  }
}
</style>
