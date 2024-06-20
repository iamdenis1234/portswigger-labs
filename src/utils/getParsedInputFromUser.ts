import * as commander from "commander";
import { Command } from "commander";
import { getHttpClient } from "./httpClient.js";
import { AxiosInstance } from "axios";

export { getParsedInputFromUser };

type Config = {
  description: string;
  concurrency?: boolean;
  proxy?: boolean;
};

// TODO: add verification that a link belongs to a specific lab
function getParsedInputFromUser(config: Config): {
  labUrl: URL;
  concurrencyLimit: number;
  httpClient: AxiosInstance;
} {
  const program = createCommand(config);
  program.parse();

  const options = program.opts();

  return {
    labUrl: program.processedArgs[0],
    concurrencyLimit: options.concurrency,
    httpClient: getHttpClient({ useProxy: options.proxy }),
  };
}

function createCommand(config: Config) {
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

function parseUrl(str: string) {
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
  url.pathname = "";
  return url;
}

function parseConcurrency(str: string) {
  const number = Number.parseInt(str, 10);
  if (!isConcurrencyNumberValid(number)) {
    throw new commander.InvalidArgumentError(
      "Concurrency must be integer greater than 0",
    );
  }
  return number;
}

function isConcurrencyNumberValid(number: number) {
  return !isNaN(number) && Number.isInteger(number) && number > 0;
}
