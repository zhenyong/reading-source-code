import fs from "fs";

const COMMIT_NOTES_FILE =
  "/Users/zy/codes/read-vue3-source/src/data/202204221518.commitnotes.json";

const COMMITS_RAW_FILE =
  "/Users/zy/codes/read-vue3-source/src/data/commits.json";

const notesCommits = JSON.parse(fs.readFileSync(COMMIT_NOTES_FILE));
const rawCommits = JSON.parse(fs.readFileSync(COMMITS_RAW_FILE));

const arr = [];

for (const [sha, info] of Object.entries(notesCommits)) {
  arr.push(`# ${sha.substring(0, 8)}`);
  const rawCommit = rawCommits.find((item) => item.sha === sha);
  arr.push(`> ${rawCommit.commit.message}`);
  info.content && arr.push(info.content);
  info.files.forEach((file) => {
    const notes = file?.custom?.notes;
    if (notes) {
      arr.push(`## ${file.filename}`);
      arr.push(notes.replace(/^#/gm, "##"));
    }
  });
}
fs.writeFileSync("all-notes.md", arr.join("\n"));
