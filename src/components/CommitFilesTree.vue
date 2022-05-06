<template>
  <div class="wrap" v-loading="!vm.treeData">
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
      @node-click="handleNodeClick"
      v-loading="vm.treePending"
      :data="vm.treeData"
      show-checkbox
    >
      <template #default="{ node, data }">
        <div class="node-innerwrap">
          <span :class="data.raw?.status ? `status-${data.raw?.status}` : ''">{{
            node.label
          }}</span>
          <span v-if="data.path === ''">
            （{{
              store.curItem?.sha
                ? `${store.doneFiles?.length || 0}/${
                    store.curFiles?.length || "-"
                  }`
                : ""
            }}）
          </span>
          <span
            class="btn-copy"
            @click="
              (e) => {
                e.stopPropagation();
                copy(data.path).then(() => {
                  vm.copySuccessPath = data.path;
                });
              }
            "
          >
            <el-icon>
              <finished
                color="#1a7f37"
                v-if="vm.copySuccessPath === data.path"
              />
              <copy-document v-else />
            </el-icon>
          </span>
        </div>
      </template>
    </el-tree>
    <FileNoteDialog ref="dialogRef" />
  </div>
</template>

<script setup lang="ts">
import { useCommitsStore } from "@/stores/commits";
import { computed, onMounted, onUpdated, reactive, ref, toRaw } from "vue";
import type { ICommitFile } from "@/types/";
import { watch } from "vue";
import FileNoteDialog from "./FileNoteDialog.vue";
import { CopyDocument } from "@element-plus/icons-vue";
import copy from "clipboard-copy";

const excludeFile = ["yarn.lock", ".npmignore"];

const dialogRef = ref();
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
  copySuccessPath: "",
});

type ITreeNode = {
  label: string;
  path: string;
  status?: "undo" | "done";
  dir: boolean;
  children?: ITreeNode[];
  raw?: ICommitFile;
};

const handleNodeClick = (nodeData: ITreeNode) => {
  const fileInfo = store.curFiles?.find(
    (item) => item.filename === nodeData.path
  );
  if (fileInfo) {
    dialogRef.value.show(fileInfo);
  }
  // 展示弹窗编辑器
  // data.path
};

watch(
  () => store.curItem?.sha && store.commitInfoMap[store.curItem?.sha]?.files,
  (files) => {
    if (files) {
      console.log(">>files change", files);
      vm.treeData = convertToTree(files || []);
      console.log("vm.treeData", vm.treeData);
    }
  },
  { immediate: true }
);

const defaultCheckedKeys = computed(() => {
  const { curItem, commitInfoMap } = store;
  const keys = curItem
    ? (commitInfoMap[curItem.sha]?.files || ([] as ICommitFile[]))
        .filter((item) => {
          return item.custom?.status === "done";
        })
        .map((item) => item.filename)
    : [];
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
    if (excludeFile.includes(raw.filename.split("/").pop()!)) return;
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

<style lang="scss" scoped>
.wrap {
  flex: 1;
  overflow: auto;
  margin-top: 8px;
}
.node-innerwrap {
  display: flex;
  align-items: center;
  .btn-copy {
    display: none;
    margin-left: 4px;
  }
}

:deep(.el-tree-node__content) {
  .status-removed {
    text-decoration: line-through;
    text-decoration-color: #999;
  }
  &:hover {
    .btn-copy {
      display: flex;
    }
  }
}
</style>
