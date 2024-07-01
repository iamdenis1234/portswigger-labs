import { createHmac, createSign, KeyObject } from "node:crypto";
import { toBase64Url } from "../../../utils/toBase64Url.js";

export { JWT };

class JWT {
  readonly #header: string;
  readonly #payload: string;
  readonly #signature: string | undefined;

  constructor(
    jwt: string | { header: object; payload: object; signature?: Buffer },
  ) {
    if (typeof jwt === "string") {
      const [header, payload, signature] = jwt.split(".");
      this.#header = header;
      this.#payload = payload;
      this.#signature = signature;
    } else {
      this.#header = toBase64Url(jwt.header);
      this.#payload = toBase64Url(jwt.payload);
      if (jwt.signature) {
        this.#signature = jwt.signature.toString("base64url");
      }
    }
  }

  getUnsigned() {
    return [this.#header, this.#payload].join(".");
  }

  sign(secret: string) {
    const signature = createHmac("sha256", secret)
      .update(this.getUnsigned())
      .digest("base64url");
    return new JWT([this.#header, this.#payload, signature].join("."));
  }

  signWithPrivateKey(privateKey: KeyObject) {
    const signature = createSign("sha256")
      .update(this.getUnsigned())
      .sign(privateKey, "base64url");
    return new JWT([this.#header, this.#payload, signature].join("."));
  }

  get signature() {
    return this.#signature;
  }

  toString() {
    return [this.#header, this.#payload, this.#signature].join(".");
  }
}
