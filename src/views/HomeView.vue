<script setup lang="ts">
import { useEditor } from "@/hooks/editor";
import { useTree } from "@/hooks/tree";
import { useFileTreeStore } from "@/stores/fileTree";
import { file } from "@babel/types";
import { Upload } from "@element-plus/icons-vue";
import type { TreeNodeData } from "element-plus/lib/components/tree/src/tree.type";
import { computed, onMounted, ref, watch } from "vue";
import { debounce } from "lodash";
import { CopyDocument } from "@element-plus/icons-vue";
import copy from "clipboard-copy";

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
const copySuccessPath = ref("");

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
const checkedKeys = computed(() => {
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
  <div>
    {{ checkedKeys.length }}/{{ fileTreeStore.flattenItems.length }}<br />
  </div>
  <main>
    <el-tree
      class="tree"
      :default-expanded-keys="vm.expandedKeys"
      :default-checked-keys="checkedKeys"
      v-loading="loading"
      @check-change="handleCheckChange"
      @node-click="handleNodeClick"
      @node-expand="handleNodeExpand"
      @node-collapse="handleNodeCollapse"
      :props="{ disabled: 'dir' }"
      node-key="path"
      :data="(fileTreeStore.tree as any)"
      show-checkbox
    >
      <template #default="{ node, data }">
        <div class="node-innerwrap">
          <span
            :class="data.raw?.status ? `status-${data.raw?.status}` : ''"
            @click.meta.stop="
              () => {
                window
                  .open(
                    `https://github.com/vuejs/core/blob/main/${data.path}`,
                    '_blank'
                  )
                  ?.focus();
              }
            "
            >{{ node.label }}</span
          >
          <!-- <span v-if="data.path === ''">
            （{{
              store.curItem?.sha
                ? `${store.doneFiles?.length || 0}/${
                    store.curFiles?.length || "-"
                  }`
                : ""
            }}）
          </span> -->
          <span
            class="btn-copy"
            @click="
              (e) => {
                debugger;
                e.stopPropagation();
                copy(data.path).then(() => {
                  copySuccessPath = data.path;
                });
              }
            "
          >
            <el-icon>
              <finished color="#1a7f37" v-if="copySuccessPath === data.path" />
              <copy-document v-else />
            </el-icon>
          </span>
        </div>
      </template>
    </el-tree>
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
.tree {
  height: 100vh;
  overflow: auto;
}
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
