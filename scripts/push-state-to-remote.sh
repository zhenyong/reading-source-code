#!/bin/sh

cd /Users/zy/tmp/gist/reading-vue3-src-tree.json;
echo "$1" >> /Users/zy/tmp/gist/reading-vue3-src-tree.json/reading-vue3-src-tree.json;
git add .;
git commit -m "update";
git push origin main;
