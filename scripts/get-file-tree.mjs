import GitHub from "github-api";
import fs from "fs";
const gh = new GitHub();
let repo = gh.getRepo("vuejs", "vue");
repo.getTree("master?recursive=1", function (err, data) {
  if (err) {
    console.dir(err.status);
  }
  fs.writeFileSync(
    "/Users/zy/codes/reading-source-code/src/assets/fileTree.json",
    JSON.stringify(data.tree)
  );
});
