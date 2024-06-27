import fs from "fs/promises";

export { getJwtSecrets };

async function getJwtSecrets() {
  const path = new URL("../../config/jwt.secrets.list", import.meta.url);
  const fileContent = await fs.readFile(path, "utf-8");
  return fileContent.split(/\s+/);
}
