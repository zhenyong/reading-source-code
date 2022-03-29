import type { TreeNodeData } from "element-plus/lib/components/tree/src/tree.type";
import { reactive, watchEffect } from "vue";

const STORAGE_KEY_EXPANDED_KEYS = "EXPANDED_KEYS";
const defaultExpandedKyes = JSON.parse(
  localStorage.getItem(STORAGE_KEY_EXPANDED_KEYS) || "[]"
);

export const useTree = () => {
  const vm = reactive({
    expandedKeys: defaultExpandedKyes as string[],
  });

  const handleNodeExpand = (data: TreeNodeData) => {
    const index = vm.expandedKeys.indexOf(data.path);
    if (index === -1) {
      vm.expandedKeys.push(data.path);
    }
  };

  const handleNodeCollapse = (data: TreeNodeData) => {
    const index = vm.expandedKeys.indexOf(data.path);
    if (index !== -1) {
      vm.expandedKeys.splice(index, 1);
    }
  };

  watchEffect(() => {
    localStorage.setItem(
      STORAGE_KEY_EXPANDED_KEYS,
      JSON.stringify(vm.expandedKeys)
    );
  });

  return { vm, handleNodeExpand, handleNodeCollapse };
};
