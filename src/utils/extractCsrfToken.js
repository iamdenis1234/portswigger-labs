import { parse } from "node-html-parser";

export { extractCsrfToken };

function extractCsrfToken(html) {
  const root = parse(html);
  const elem = root.querySelector("input[name='csrf']");
  return elem.getAttribute("value");
}
