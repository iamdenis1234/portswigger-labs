import PQueue from "p-queue";

export { runTasks };

function runTasks(tasks, concurrencyLimit) {
  const queue = new PQueue({ concurrency: concurrencyLimit });

  for (const task of tasks) {
    queue.add(task).catch((e) => {
      console.log(e);
    });
  }
}
