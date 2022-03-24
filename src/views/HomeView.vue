<script setup lang="ts">
import TreeItem from "@/components/TreeItem.vue";
import { useFileTreeStore } from "@/stores/fileTree";
const fileTreeStore = useFileTreeStore();
</script>

<template>
  <main><TreeItem :model="fileTreeStore.root" /></main>
</template>
