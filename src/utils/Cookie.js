export { Cookie };

class Cookie {
  #name;
  #value;

  constructor(name, value) {
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
