import fs from "fs/promises";

export { getProxy };

async function getProxy(): Promise<{
  protocol: string;
  host: string;
  port: number;
}> {
  const path = new URL("../../config/proxy.json", import.meta.url);
  const fileContent = await fs.readFile(path, "utf-8");
  const proxy = JSON.parse(fileContent);
  if (!proxy.protocol && !proxy.host && !proxy.port) {
    throw new Error(
      'proxy config must contain "protocol", "host" and "port" properties',
    );
  }
  return proxy;
}
