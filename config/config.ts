import fs from "fs/promises";

export { getPasswords, getProxy };

// TODO: maybe move functions to separate files
async function getPasswords() {
  const path = new URL("./passwords.txt", import.meta.url);
  const fileContent = await fs.readFile(path, "utf-8");
  return fileContent.split(/\s+/);
}

async function getProxy(): Promise<{
  protocol: string;
  host: string;
  port: number;
}> {
  const path = new URL("./proxy.json", import.meta.url);
  const fileContent = await fs.readFile(path, "utf-8");
  return JSON.parse(fileContent);
}
