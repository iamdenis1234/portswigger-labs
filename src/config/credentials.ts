export { Credentials, myCredentials, victimsCredentials };

interface Credentials {
  username: string;
  password: string;
}

const myCredentials: Credentials = {
  username: "wiener",
  password: "peter",
};

const victimsCredentials: Credentials = { username: "carlos", password: "" };
