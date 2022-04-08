<template>
  <div>
    <!-- :default-expanded-keys="vm.expandedKeys"
      :default-checked-keys="defaultCheckedKeys"
      v-loading="loading"
      @check-change="handleCheckChange"
      @node-click="handleNodeClick"
      @node-expand="handleNodeExpand"
      @node-collapse="handleNodeCollapse"
      :props="{ disabled: 'dir' }"
      node-key="path" -->
    <el-tree :data="treeData" show-checkbox />
  </div>
</template>

<script setup lang="ts">
import { useCommitsStore } from "@/stores/commits";
import { computed } from "vue";
import type { ICommitFile } from "@/types/";

const store = useCommitsStore();

type ITreeNode = {
  label: string;
  path: string;
  status: "undo" | "done";
  dir: boolean;
  children?: ITreeNode[];
  raw?: ICommitFile;
};

function convertToTree(rawNodes: ICommitFile[]) {
  const root = { children: [] as ITreeNode[], path: "", dir: true };

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
  return root.children;
}

const treeData = computed(() => {
  console.log(">>>computed tree");
  if (store.curFiles) {
    return convertToTree(store.curFiles);
  }
});
</script>

<style lang="scss" scoped></style>
