import { parse } from "node-html-parser";

export { replaceActionAttribute };

function replaceActionAttribute(html, url) {
  const parsedHtml = parse(html);
  parsedHtml.querySelector("form").setAttribute("action", url);

  return parsedHtml.toString();
}
