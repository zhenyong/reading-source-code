import "@toast-ui/editor/dist/toastui-editor.css";
import "prismjs/themes/prism.css";
import "@toast-ui/editor-plugin-code-syntax-highlight/dist/toastui-editor-plugin-code-syntax-highlight.css";

import { onMounted } from "vue";
import Editor, { EditorCore } from "@toast-ui/editor";
// @ts-ignore
import codeSyntaxHighlight from "@toast-ui/editor-plugin-code-syntax-highlight/dist/toastui-editor-plugin-code-syntax-highlight-all";
import Prism from "prismjs";

export const useEditor = (domId: string, initialValueFn: () => string) => {
  const el = document.createElement("div");
  document.body.appendChild(el);
  Object.assign(el.style, { position: "absolute", left: "-9999px" });

  const editor = new Editor({
    el,
    previewStyle: "tab",
    initialValue: initialValueFn(),
    plugins: [[codeSyntaxHighlight, { highlighter: Prism }]],
    initialEditType: "markdown",
  });
  onMounted(() => {
    document.querySelector("#editor")?.appendChild(el);
    Object.assign(el.style, {});
  });
  return editor;
};
