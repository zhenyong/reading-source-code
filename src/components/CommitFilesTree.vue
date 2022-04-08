<template>
  <div v-loading="!vm.treeData">
    <!-- 
      @node-expand="handleNodeExpand"
      @node-collapse="handleNodeCollapse"
      -->
    <el-tree
      v-if="vm.treeData"
      :default-checked-keys="defaultCheckedKeys"
      :props="{ disabled: 'dir' }"
      node-key="path"
      :default-expand-all="true"
      @check-change="handleCheckChange"
      v-loading="vm.treePending"
      :data="vm.treeData"
      show-checkbox
    />
  </div>
</template>

<script setup lang="ts">
import { useCommitsStore } from "@/stores/commits";
import { computed, onMounted, onUpdated, reactive, ref, toRaw } from "vue";
import type { ICommitFile } from "@/types/";
import { watch } from "vue";

onUpdated(() => {
  console.log(`the component is now updated.`);
});
onMounted(() => {
  console.log(`the component is now mounted.`);
});

const store = useCommitsStore();

const vm = reactive({
  treeData: null as null | ITreeNode[],
  treePending: false,
});

type ITreeNode = {
  label: string;
  path: string;
  status?: "undo" | "done";
  dir: boolean;
  children?: ITreeNode[];
  raw?: ICommitFile;
};

watch(
  () => store.curItem?.sha,
  (sha) => {
    if (sha) {
      console.log(">>sha change", sha);
      vm.treeData = convertToTree(store.commitInfoMap[sha].files || []);
    }
  },
  { immediate: true }
);

const defaultCheckedKeys = computed(() => {
  const { curItem, commitInfoMap } = store;
  const keys = curItem
    ? (commitInfoMap[curItem.sha].files || ([] as ICommitFile[]))
        .filter((item) => {
          return item.custom?.status === "done";
        })
        .map((item) => item.filename)
    : [];
  console.log(">>>computed defaultCheckedKeys", keys);
  return keys;
});

const handleCheckChange = async (
  data: ITreeNode,
  checked: boolean,
  indeterminate: boolean // 是否半选
) => {
  if (!data.dir) {
    console.log(">>>handleCheckChange", data);
    vm.treePending = true;
    store.toggleCheck(data.path, checked);
    vm.treePending = false;
  }
};

function convertToTree(rawNodes: ICommitFile[]) {
  const root = {
    label: "All",
    children: [] as ITreeNode[],
    path: "",
    dir: true,
  };

  rawNodes.forEach((raw) => {
    let node: ITreeNode | typeof root = root;
    let pathUnderPNode = "";
    let remainPath = raw.filename.split("/");
    while (node && remainPath.length) {
      const label = remainPath[0];
      pathUnderPNode = pathUnderPNode
        ? `${pathUnderPNode}/${remainPath[0]}`
        : remainPath[0];
      remainPath = remainPath.slice(1);

      let tmpNode: ITreeNode | undefined = node.children
        ? node.children?.find((v) => {
            return v.path === pathUnderPNode;
          })
        : undefined;
      if (!tmpNode) {
        const commonObj = {
          label,
          status: "undo" as const,
          path: pathUnderPNode,
        };
        tmpNode =
          remainPath.length > 0
            ? { ...commonObj, dir: true, children: [] as ITreeNode[] }
            : { ...commonObj, dir: false, raw };

        (node.children = node.children || []).push(tmpNode);
      } else {
      }
      node = tmpNode;
    }
  });
  return [root];
}
</script>

<style lang="scss" scoped></style>
