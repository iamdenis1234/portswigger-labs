import fs from "fs/promises";

export { getFileContent };

async function getFileContent(path) {
  return await fs.readFile(path, "utf-8");
}
