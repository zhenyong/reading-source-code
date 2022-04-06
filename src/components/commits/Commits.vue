<template>
  <ul>
    <li v-for="item in vm.list" :key="item.sha">
      <div>{{ item.commit.message }}</div>
      <div>{{ item.sha.substring(0, 8) }} {{ item.commit.committer.date }}</div>
    </li>
  </ul>
</template>

<script lang="ts" setup>
import { reactive } from "vue";
//@ts-ignore-next-line
import list from "@/data/commits";

const vm = reactive({
  list,
});
</script>

<style lang="scss">
ul {
  overflow: scroll;
  width: 400px;
  height: 100vh;
  padding: 0;
  margin: 0;
  list-style: none;
  > li {
    padding: 16px;
    /* display: flex; */
    /* align-items: center; */
    /* justify-content: center; */
    background: var(--el-color-primary-light-9);
    margin: 10px;
    color: var(--el-color-primary);
  }
  > li + li {
    margin-top: 10px;
  }
}
</style>
