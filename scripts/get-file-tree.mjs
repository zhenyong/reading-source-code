import GitHub from "github-api";
import fs from "fs";
const gh = new GitHub();
let repo = gh.getRepo("vuejs", "core");

repo.getTree("main?recursive=1", function (err, data) {
  console.log(data)
  if (err) {
    console.dir(err.status);
  }
  fs.writeFileSync(
    "/Users/zy/codes/reading-source-code/src/data/rawFiles.json",
    JSON.stringify(data.tree)
  );
  fs.writeFileSync(
    "/Users/zy/codes/reading-source-code/src/data/fileTree.json",
    JSON.stringify(convertToTree(data.tree))
  );
});

function convertToTree(rawNodes) {
  const root = { children: [], path: "", dir: true };

  function insertNode(meta) {
    let node = root;
    let pathUnderPNode = "";
    let remainPath = meta.path.split("/");
    while (node && remainPath.length) {
      const label = remainPath[0];
      pathUnderPNode = pathUnderPNode
        ? `${pathUnderPNode}/${remainPath[0]}`
        : remainPath[0];
      remainPath = remainPath.slice(1);

      let tmpNode = node.children?.find((v) => {
        return v.path === pathUnderPNode;
      });
      if (!tmpNode) {
        const commonObj = {
          label,
          status: "undo",
          path: pathUnderPNode,
          dir: meta.type === "tree",
        };
        tmpNode =
          remainPath.length > 0
            ? { ...commonObj, children: [] }
            : { ...commonObj, meta };

        (node.children = node.children || []).push(tmpNode);
      } else {
      }
      node = tmpNode;
    }
  }
  rawNodes.forEach(insertNode);
  return root.children;
}
