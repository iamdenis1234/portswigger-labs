import fs from "fs/promises";

export { getFileContent };

async function getFileContent(path) {
  // const path = new URL("../../config/proxy.json", import.meta.url);
  return await fs.readFile(path, "utf-8");
}
