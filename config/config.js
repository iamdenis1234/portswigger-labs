import fs from "fs/promises";

export { getPasswords, getProxy };

async function getPasswords() {
  const path = new URL("./passwords.txt", import.meta.url);
  const fileContent = await fs.readFile(path, "utf-8");
  return fileContent.split(/\s+/);
}

async function getProxy() {
  const path = new URL("./proxy.json", import.meta.url);
  const fileContent = await fs.readFile(path, "utf-8");
  return JSON.parse(fileContent);
}
