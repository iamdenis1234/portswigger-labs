import PQueue from "p-queue";
import { handleError } from "./handeError.js";

export { runTasks };

function runTasks(tasks, concurrencyLimit = 1) {
  const queue = new PQueue({ concurrency: concurrencyLimit });

  for (const task of tasks) {
    queue.add(task).catch(handleError);
  }
}
