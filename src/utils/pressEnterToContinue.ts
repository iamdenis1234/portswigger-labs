import * as readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

export { pressEnterToContinue };

async function pressEnterToContinue(message: string) {
  const rl = readline.createInterface({ input, output });
  console.log(message);
  await rl.question("\nPress Enter to continue");
  rl.close();
  console.log("Continuing...\n");
}
