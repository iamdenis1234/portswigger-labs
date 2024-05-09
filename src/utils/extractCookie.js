export { extractCookie };

// TODO: make all labs that extracts cookies use this function
function extractCookie(response, cookieName) {
  const cookies = response.headers["set-cookie"];
  const result = {};

  for (const cookie of cookies) {
    const [nameValue] = cookie.split(";");
    const [name, value] = nameValue.split("=");

    if (name === cookieName) {
      result.name = name;
      result.value = value;
      break;
    }
  }

  return result;
}
