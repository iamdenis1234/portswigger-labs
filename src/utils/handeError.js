export { handleError };

function handleError(error) {
  console.log(error);
  console.log("\n");
  handleNetworkError(error);
  console.log();
  process.exit(1);
}

function handleNetworkError(error) {
  if (error.response?.status === 504) {
    console.log("Looks like your lab time has expired");
  }
  if (error.code === "ECONNREFUSED") {
    console.log("Looks like your proxy is not working");
  }
  if (error.code === "ETIMEDOUT") {
    console.log("Looks like you have set the concurrency level too high");
  }
}
