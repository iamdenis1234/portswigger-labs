import fs from "fs/promises";

export { getPasswords };

async function getPasswords() {
  const path = new URL("../../config/passwords.txt", import.meta.url);
  const fileContent = await fs.readFile(path, "utf-8");
  return fileContent.split(/\s+/);
}
