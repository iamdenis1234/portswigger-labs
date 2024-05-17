export { Cookie };

class Cookie {
  readonly #name: string;
  readonly #value: string;

  constructor(name: string, value: string) {
    this.#name = name;
    this.#value = value;
  }

  toString() {
    return `${this.name}=${this.value}`;
  }

  get name() {
    return this.#name;
  }

  get value() {
    return this.#value;
  }
}
