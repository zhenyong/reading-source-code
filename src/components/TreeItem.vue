<script setup lang="ts">
import { useFileTreeStore } from "@/stores/fileTree";
import type { TreeNode } from "@/stores/fileTree";

const props = defineProps<{ model: TreeNode }>();

const fileTreeStore = useFileTreeStore();
</script>

<template>
  <div>
    <label :for="model.path" v-if="model.path">
      <input type="checkbox" :id="model.path" />
      <div>{{ model.path.split("/").pop() }}</div>
    </label>
    <ul v-if="model.items?.length">
      <li v-for="item in model.items" key="model.path">
        <TreeItem :model="item" />
      </li>
    </ul>
  </div>
</template>

<style scope>
label {
  display: flex;
  align-items: center;
}
li,
ul {
  list-style: none;
}
input[type="checkbox"] {
  margin-right: 4px;
  display: inline-block;
}
</style>
