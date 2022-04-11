import "@toast-ui/editor/dist/toastui-editor.css";
import "prismjs/themes/prism.css";
import "@toast-ui/editor-plugin-code-syntax-highlight/dist/toastui-editor-plugin-code-syntax-highlight.css";

import { onBeforeUnmount, onMounted, onUpdated } from "vue";
import Editor, { EditorCore } from "@toast-ui/editor";
// @ts-ignore
import codeSyntaxHighlight from "@toast-ui/editor-plugin-code-syntax-highlight/dist/toastui-editor-plugin-code-syntax-highlight-all";
import Prism from "prismjs";

export const useEditor = (
  domSelector: string,
  options: {
    initialValueFn?: () => string;
    change: (content: string) => void;
    lazyAppend?: boolean;
    height?: string;
  }
) => {
  const { initialValueFn, lazyAppend = false, height = "100%" } = options;
  let el: HTMLElement = document.querySelector(domSelector)!;
  let hasAppended = false;
  if (lazyAppend) {
    el = document.createElement("div");
    document.body.appendChild(el);
    Object.assign(el.style, { position: "absolute", left: "-9999px" });
  }

  const editor = new Editor({
    el,
    autofocus: false,
    previewStyle: "vertical",
    initialValue: initialValueFn ? initialValueFn() : "",
    plugins: [[codeSyntaxHighlight, { highlighter: Prism }]],
    initialEditType: "markdown",
    height,
    events: {
      change() {
        options.change(editor.getMarkdown());
      },
    },
  });

  const tryAppend = () => {
    if (!lazyAppend || hasAppended) return;
    const ct = document.querySelector(domSelector);
    if (ct) {
      document.querySelector(domSelector)?.appendChild(el);
      hasAppended = true;
      Object.assign(el.style, { position: "", left: "" });
    }
  };

  onMounted(() => {
    tryAppend();
  });
  onUpdated(() => {
    tryAppend();
  });

  onBeforeUnmount(() => {
    editor.destroy();
    document.querySelector(domSelector)?.removeChild(el);
  });
  return editor;
};
