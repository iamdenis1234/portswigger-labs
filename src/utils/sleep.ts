export { sleep };

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
