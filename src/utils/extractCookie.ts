import { AxiosResponse } from "axios";
import { Cookie } from "./Cookie.js";

export { extractCookie };

function extractCookie(response: AxiosResponse, cookieName: string): Cookie {
  const cookies = response.headers["set-cookie"] || [];

  for (const cookie of cookies) {
    const [name, value] = cookie.split(";")[0].split("=");

    if (name === cookieName) {
      return new Cookie(name, value);
    }
  }

  throw new Error(`No Cookie with name "${cookieName}" found`);
}
