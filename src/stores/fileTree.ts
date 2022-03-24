import { defineStore } from "pinia";
import fileTreeJson from "./fileTree.json";

interface INodeMeta {
  path: string;
  mode: string;
  type: string;
  sha: string;
  size: number;
  url: string;
}

export type TreeNode = {
  // customer
  root?: boolean;
  items?: TreeNode[];
  meta?: INodeMeta;
  dir: boolean;
  path: string;
};

function convertToTree(rawNodes: INodeMeta[]) {
  const root = { items: [] as TreeNode[], path: "", dir: true };

  function insertNode(meta: INodeMeta) {
    let node: TreeNode = root;
    let pathUnderPNode = "";
    let remainPath = meta.path.split("/");
    while (node && remainPath.length) {
      pathUnderPNode = pathUnderPNode
        ? `${pathUnderPNode}/${remainPath[0]}`
        : remainPath[0];
      remainPath = remainPath.slice(1);

      let tmpNode: TreeNode | undefined = node.items?.find(
        (v) => v.path === pathUnderPNode
      );
      if (!tmpNode) {
        tmpNode =
          remainPath.length > 0
            ? { path: pathUnderPNode, items: [] as TreeNode[], dir: true }
            : { path: pathUnderPNode, meta, dir: false };

        (node.items = node.items || []).push(tmpNode);
      }
      node = tmpNode;
    }
  }
  rawNodes.forEach(insertNode);
  return root;
}

export const useFileTreeStore = defineStore({
  id: "fileTree",
  state: () => ({
    rawItems: fileTreeJson as INodeMeta[],
  }),
  getters: {
    root(state) {
      return convertToTree(state.rawItems);
    },
  },
  actions: {},
});
