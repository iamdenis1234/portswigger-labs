import fs from "fs/promises";

export { getProxy };

async function getProxy(): Promise<{
  protocol: string;
  host: string;
  port: number;
}> {
  const path = new URL("../../config/proxy.json", import.meta.url);
  const fileContent = await fs.readFile(path, "utf-8");
  return JSON.parse(fileContent);
}
