import "@toast-ui/editor/dist/toastui-editor.css";
import "prismjs/themes/prism.css";
import "@toast-ui/editor-plugin-code-syntax-highlight/dist/toastui-editor-plugin-code-syntax-highlight.css";

import { onBeforeUnmount, onMounted } from "vue";
import Editor, { EditorCore } from "@toast-ui/editor";
// @ts-ignore
import codeSyntaxHighlight from "@toast-ui/editor-plugin-code-syntax-highlight/dist/toastui-editor-plugin-code-syntax-highlight-all";
import Prism from "prismjs";

export const useEditor = (
  domSelector: string,
  options: { initialValueFn: () => string; change: (content: string) => void }
) => {
  const { initialValueFn } = options;
  const el = document.createElement("div");
  document.body.appendChild(el);
  Object.assign(el.style, { position: "absolute", left: "-9999px" });

  const editor = new Editor({
    el,
    autofocus: false,
    previewStyle: "tab",
    initialValue: initialValueFn(),
    plugins: [[codeSyntaxHighlight, { highlighter: Prism }]],
    initialEditType: "markdown",
    height: "700px",
    events: {
      change() {
        options.change(editor.getMarkdown());
      },
    },
  });

  onMounted(() => {
    document.querySelector(domSelector)?.appendChild(el);
    Object.assign(el.style, { position: "", left: "" });
  });

  onBeforeUnmount(() => {
    editor.destroy();
    document.querySelector(domSelector)?.removeChild(el);
  });
  return editor;
};
