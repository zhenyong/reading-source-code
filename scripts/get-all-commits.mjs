import GitHub from "github-api";
import fs from "fs";
const gh = new GitHub({
  token: "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",
});

let repo = gh.getRepo("vuejs", "core");

let count = 0;

const per_page = 30;
const FILE = "/Users/zy/codes/reading-source-code/src/data/commits.json";
async function loadMoreCommits(page = 1, arr) {
  if (fs.existsSync(FILE)) {
    arr = JSON.parse(fs.readFileSync(FILE));
  } else {
    arr = [];
  }
  const resp = await repo.listCommits({ page, per_page });
  const rawData = resp.data;
  const data = rawData.slice(0).reverse();
  if (arr.length && data[data.length - 1].sha === arr[0].sha) {
    data.splice(-1);
  }
  arr = data.concat(arr);
  console.log(arr.length);
  fs.writeFileSync(FILE, JSON.stringify(arr));
  if (rawData && rawData.length >= per_page) {
    return loadMoreCommits(page + 1);
  }
  return arr;
}

await loadMoreCommits();
