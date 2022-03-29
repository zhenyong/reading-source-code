import { defineStore } from "pinia";
import rawFileTreeJson from "@/data/fileTree.json";
import { mapValues, isPlainObject } from "lodash-es";
import { pushStateToRemote } from "@/api";
import { throttle } from "lodash";
interface INodeMeta {
  path: string;
  mode: string;
  type: string;
  sha: string;
  size: number;
  url: string;
}

enum Status {
  DONE = "done",
  UNDO = "undo",
}

export type TreeNode = {
  label: string;
  children?: TreeNode[];
  meta?: INodeMeta;
  dir: boolean;
  path: string;
  status: Status;
  notes?: string;
};

let fileTreeData = rawFileTreeJson;
const fileTreeLocalStorage = localStorage.getItem("FILE_TREE_STORE");
if (fileTreeLocalStorage) {
  fileTreeData = JSON.parse(fileTreeLocalStorage).tree;
} else {
  localStorage.setItem("FILE_TREE_STORE", JSON.stringify(rawFileTreeJson));
}

const flatten = (item: any) => {
  const { children, ...props } = item;
  return !item.dir ? props : [props].concat(children.map(flatten));
};

const findNodeByPath = (path: string, tree: TreeNode[]) => {
  const paths = path.split("/");
  let nextPath = "";
  let nodes: TreeNode[] | undefined = tree;
  let node;
  while (paths.length) {
    nextPath = nextPath + (nextPath ? "/" : "") + paths.shift();
    node = nodes?.find((item) => item.path === nextPath);
    nodes = node?.children;
  }
  return node;
};

const _useFileTreeStore = defineStore({
  id: "fileTree",
  state: () => ({
    tree: fileTreeData as TreeNode[],
    /**
     * 当前节点
     */
    curNode: undefined as TreeNode | undefined,
    pushStatePending: false,
  }),
  getters: {
    flattenItems: (state) => {
      const flat = (items: TreeNode[]): TreeNode[] => {
        return items.reduce((acc, item) => {
          return acc
            .concat(item)
            .concat(item.children ? flat(item.children) : []);
        }, [] as TreeNode[]);
      };
      return flat(state.tree);
    },
  },
  actions: {
    updateCurNodeNotes(content: string) {
      if (!this.curNode) {
        throw new Error("no any node selected");
      }
      const targetNode = findNodeByPath(this.curNode.path, this.tree);
      if (targetNode) {
        targetNode.notes = content;
      }
    },
    activeNode(node: any) {
      const targetNode = findNodeByPath(node.path, this.tree);
      this.curNode = targetNode;
    },
    toggleCheck(path: string, checked: boolean) {
      console.log(">>>toggle check");
      const targetNode = findNodeByPath(path, this.tree);
      if (targetNode) {
        targetNode.status = checked ? Status.DONE : Status.UNDO;
      }
    },
  },
});

const throttlePushStatePerHalfMin = throttle(pushStateToRemote, 30 * 1000, {
  leading: true,
  trailing: true,
});

export const useFileTreeStore = () => {
  const store = _useFileTreeStore();
  store.$subscribe(async (x, state) => {
    console.info("subscribe:state got change");
    const strJson = JSON.stringify(state);
    localStorage.setItem("FILE_TREE_STORE", strJson);
    // TODO 这里改了 pushStatePending 又会出发 subscribe 处理，咋整？？
    // state.pushStatePending = true;
    await throttlePushStatePerHalfMin(strJson);
    // state.pushStatePending = false;
  });
  return store;
};
