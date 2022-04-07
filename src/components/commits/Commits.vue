<template>
  <ul>
    <li
      v-for="item in vm.list.slice(0, 1000)"
      :key="item.sha"
      :class="{ selected: item.sha === store.curItem?.sha }"
      @click="$emit('click', item)"
      @click.meta="
        () => {
          window
            .open(`https://github.com/vuejs/core/commit/${item.sha}`, '_blank')
            ?.focus();
        }
      "
    >
      <div class="msg">{{ item.commit.message }}</div>
      <div>{{ item.sha.substring(0, 8) }} {{ item.commit.committer.date }}</div>
    </li>
  </ul>
</template>

<script lang="ts" setup>
import { reactive } from "vue";
//@ts-ignore-next-line
import list from "@/data/commits";
import type { ICommitItem } from "@/types";
import { useCommitsStore } from "@/stores/commits";

const emit = defineEmits<{
  (e: "click", item: ICommitItem): void;
}>();

const store = useCommitsStore();

const vm = reactive({
  list,
});
</script>

<style lang="scss">
.msg {
  word-break: break-word;
}
ul {
  flex-shrink: 0;
  border: 1px solid #eee;
  overflow-y: auto;
  height: 100vh;
  padding: 0;
  margin: 0;
  list-style: none;
  > li {
    display: block;
    &:hover {
      background: var(--el-color-primary-light-8);
    }
    &.selected {
      background: var(--el-color-primary-light-7);
    }
    border-radius: 4px;
    width: 400px;
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
