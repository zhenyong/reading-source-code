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
  await fileTreeStore.toggleCheck(data);
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
    <textarea @change="hanldeTextChange" :value="fileTreeStore.curNodeNotes" />
  </main>
</template>

<style scope>
main {
  display: flex;
}
textarea {
  width: 640px;
  border: 1px solid #eee;
  margin-left: 28px;
}
</style>
