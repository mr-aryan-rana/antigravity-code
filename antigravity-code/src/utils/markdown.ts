import { marked } from "marked";
import hljs from "highlight.js/lib/core";

import javascript from "highlight.js/lib/languages/javascript";
import typescript from "highlight.js/lib/languages/typescript";
import python from "highlight.js/lib/languages/python";
import java from "highlight.js/lib/languages/java";
import c from "highlight.js/lib/languages/c";
import cpp from "highlight.js/lib/languages/cpp";
import go from "highlight.js/lib/languages/go";
import rust from "highlight.js/lib/languages/rust";
import php from "highlight.js/lib/languages/php";
import xml from "highlight.js/lib/languages/xml";
import css from "highlight.js/lib/languages/css";
import json from "highlight.js/lib/languages/json";
import yaml from "highlight.js/lib/languages/yaml";
import sql from "highlight.js/lib/languages/sql";
import bash from "highlight.js/lib/languages/bash";
import markdown from "highlight.js/lib/languages/markdown";

hljs.registerLanguage("javascript", javascript);
hljs.registerLanguage("typescript", typescript);
hljs.registerLanguage("python", python);
hljs.registerLanguage("java", java);
hljs.registerLanguage("c", c);
hljs.registerLanguage("cpp", cpp);
hljs.registerLanguage("go", go);
hljs.registerLanguage("rust", rust);
hljs.registerLanguage("php", php);
hljs.registerLanguage("html", xml);
hljs.registerLanguage("xml", xml);
hljs.registerLanguage("css", css);
hljs.registerLanguage("json", json);
hljs.registerLanguage("yaml", yaml);
hljs.registerLanguage("sql", sql);
hljs.registerLanguage("bash", bash);
hljs.registerLanguage("shell", bash);
hljs.registerLanguage("markdown", markdown);

export interface ParsedCodeBlock {
  lang: string;
  code: string;
  placeholderId: string;
}

/**
 * Renders markdown to HTML, but extracts fenced code blocks into
 * placeholders first so the chat UI can attach rich per-block actions
 * (Copy/Insert/Replace/Create File/etc.) after inserting the HTML.
 */
export function renderMarkdown(source: string): { html: string; codeBlocks: ParsedCodeBlock[] } {
  const codeBlocks: ParsedCodeBlock[] = [];
  let counter = 0;

  const renderer = new marked.Renderer();
  renderer.code = ({ text, lang }: { text: string; lang?: string }) => {
    const language = (lang || "").split(/\s+/)[0] || "text";
    const id = `ag-code-${Date.now()}-${counter++}`;
    codeBlocks.push({ lang: language, code: text, placeholderId: id });
    const highlighted = hljs.getLanguage(language)
      ? hljs.highlight(text, { language }).value
      : hljs.highlightAuto(text).value;
    return `<div class="ag-codeblock" data-block-id="${id}"><div class="ag-codeblock-head"><span class="ag-lang">${language}</span><span class="ag-codeblock-actions" data-actions-for="${id}"></span></div><pre><code class="hljs language-${language}">${highlighted}</code></pre></div>`;
  };

  const html = marked.parse(source, { renderer, breaks: true, gfm: true }) as string;
  return { html, codeBlocks };
}
