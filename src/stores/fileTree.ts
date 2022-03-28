import { defineStore } from "pinia";
import rawFileTreeJson from "@/data/fileTree.json";
import { mapValues, isPlainObject } from "lodash-es";

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
     * 当前节点路径
     */
    curNodePath: "",
    curNodeNotes: "",
  }),
  getters: {
    flattenItems: (state) => {
      return state.tree.reduce((acc: TreeNode[], cur: TreeNode) => {
        return acc.concat(flatten(cur));
      }, []);
    },
  },
  actions: {
    updateCurNodeNotes(content: string) {
      if (!this.curNodePath) {
        throw new Error("no any node selected");
      }
      const targetNode = findNodeByPath(this.curNodePath, this.tree);
      if (targetNode) {
        targetNode.notes = content;
      }
    },
    activeNode(node: any) {
      const path = (this.curNodePath = node.path);
      const targetNode = findNodeByPath(node.path, this.tree);
      this.curNodeNotes = targetNode?.notes || "";
    },
    toggleCheck(node: any, checked: boolean) {
      node.status = checked ? Status.DONE : Status.UNDO;
    },
  },
});

export const useFileTreeStore = () => {
  const store = _useFileTreeStore();
  store.$subscribe((x, state) => {
    localStorage.setItem("FILE_TREE_STORE", JSON.stringify(state));
  });
  return store;
};
