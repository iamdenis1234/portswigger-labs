import PQueue from "p-queue";

export { runTasks };

function runTasks(tasks: (() => void)[], concurrencyLimit = 1) {
  const queue = new PQueue({ concurrency: concurrencyLimit });

  queue.addAll(tasks).catch((reason) => {
    console.log(reason);
    process.exit(1);
  });
}
