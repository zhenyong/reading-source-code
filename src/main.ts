import { createApp } from "vue";
import { createPinia } from "pinia";
import ElementPlus from "element-plus";
import "element-plus/dist/index.css";
import * as Icons from "@element-plus/icons-vue";

import App from "./App.vue";
import router from "./router";

const app = createApp(App);
app.config.globalProperties.window = window;

app.use(ElementPlus);
app.use(createPinia());
app.use(router);
Object.keys(Icons).forEach((key) => {
  // @ts-ignore
  app.component(key, Icons[key]);
});

app.mount("#app");
