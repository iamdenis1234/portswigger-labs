import { PathLike } from "fs";
import { readFile, FileHandle } from "fs/promises";

export { getFileContent };

async function getFileContent(path: PathLike | FileHandle) {
  return await readFile(path, "utf-8");
}
