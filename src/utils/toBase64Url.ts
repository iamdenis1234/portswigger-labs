export { toBase64Url };

function toBase64Url(data: string | object) {
  if (typeof data === "string") {
    return stringToBase64Url(data);
  }
  return stringToBase64Url(JSON.stringify(data));
}

function stringToBase64Url(str: string) {
  return Buffer.from(str).toString("base64url");
}
