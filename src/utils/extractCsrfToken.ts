import { parse } from "node-html-parser";

export { extractCsrfToken };

function extractCsrfToken(html: string) {
  const elem = parse(html).querySelector("input[name='csrf']");
  const tokenValue = elem?.getAttribute("value");
  if (!tokenValue) throw new Error("No csrf token found");
  return tokenValue;
}
