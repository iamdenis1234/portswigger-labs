import { Cookie } from "./Cookie.js";

export { extractCookie };

function extractCookie(response, cookieName) {
  const cookies = response.headers["set-cookie"];

  for (const cookie of cookies) {
    const [nameValue] = cookie.split(";");
    const [name, value] = nameValue.split("=");

    if (name === cookieName) {
      return new Cookie(name, value);
    }
  }
}
