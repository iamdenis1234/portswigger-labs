import * as commander from "commander";
import { Command } from "commander";
import { getHttpClient } from "./httpClient.js";

export { getParsedInput };

// TODO: add verification that a link belongs to a specific lab
// TODO: maybe rename to getParsedInputFromUser
function getParsedInput(config) {
  const program = createCommand(config);
  program.parse();

  const options = program.opts();

  return {
    // TODO: labUrl more understandable
    url: program.processedArgs[0],
    concurrencyLimit: options.concurrency,
    httpClient: getHttpClient({ useProxy: options.proxy }),
  };
}

function createCommand(config = {}) {
  const program = new Command();
  const description = config.description || "";

  program
    .description(description)
    .argument(
      "<url>",
      "lab url, https only (e.g. 'https://0a1000e403.web-security-academy.net')",
      parseUrl,
    )
    .showHelpAfterError("(add --help for additional information)");

  if (config.proxy) {
    program.option("-p, --proxy", "use proxy from the config", false);
  }

  if (config.concurrency) {
    program.option(
      "-c, --concurrency <number>",
      "concurrency limit",
      parseConcurrency,
      5,
    );
  }

  return program;
}

function parseUrl(str) {
  let url;
  try {
    url = new URL(str);
  } catch {
    throw new commander.InvalidArgumentError(
      "Example of a valid url - 'https://0a1000e403.web-security-academy.net'",
    );
  }
  if (!url.hostname.endsWith(".web-security-academy.net")) {
    throw new commander.InvalidArgumentError(
      "Url must belong to web-security-academy.net",
    );
  }
  if (url.protocol !== "https:") {
    throw new commander.InvalidArgumentError(
      "Portswigger labs are only accessible over HTTPS",
    );
  }
  return url;
}

function parseConcurrency(str) {
  let number = Number.parseInt(str, 10);
  if (!isConcurrencyNumberValid(number)) {
    throw new commander.InvalidArgumentError(
      "Concurrency must be integer greater than 0",
    );
  }
  return number;
}

function isConcurrencyNumberValid(number) {
  return !isNaN(number) && Number.isInteger(number) && number > 0;
}
