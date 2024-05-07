import * as commander from "commander";
import { Command } from "commander";
import PQueue from "p-queue";
import { getHttpClient } from "./httpClient.js";

// TODO: add verification that a link belongs to a specific lab
export function getParsedInput(config) {
  const program = createCommand(config);
  program.parse();

  const options = program.opts();

  return {
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
  return url.origin + "/";
}

function parseConcurrency(str) {
  let number = Number.parseInt(str, 10);
  try {
    // use PQueue validation instead of custom one
    new PQueue({ concurrency: number });
  } catch (e) {
    if (e instanceof TypeError) {
      throw new commander.InvalidArgumentError(
        "Concurrency must be a number from 1 and up",
      );
    }
  }
  return number;
}
