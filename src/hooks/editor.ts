import "@toast-ui/editor/dist/toastui-editor.css";
import "prismjs/themes/prism.css";
import "@toast-ui/editor-plugin-code-syntax-highlight/dist/toastui-editor-plugin-code-syntax-highlight.css";

import { onMounted } from "vue";
import Editor, { EditorCore } from "@toast-ui/editor";
// @ts-ignore
import codeSyntaxHighlight from "@toast-ui/editor-plugin-code-syntax-highlight/dist/toastui-editor-plugin-code-syntax-highlight-all";
import Prism from "prismjs";

export const useEditor = (domId: string, initialValueFn: () => string) => {
  let obj: { editor: EditorCore | null } = { editor: null };
  onMounted(() => {
    obj.editor = new Editor({
      el: document.querySelector("#editor") as HTMLElement,
      previewStyle: "tab",
      initialValue: initialValueFn(),
      plugins: [[codeSyntaxHighlight, { highlighter: Prism }]],
      // height: '600px',
      initialEditType: "markdown",
      // previewStyle: "vertical",
    });
  });
  return obj;
};
