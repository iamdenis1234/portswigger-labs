# PortSwigger Labs

**PortSwigger Labs** - Automation of solving [PortSwigger's web security labs](https://portswigger.net/web-security/all-labs).

## Automated Labs
### Authentication
* [2FA bypass using a brute-force attack](https://portswigger.net/web-security/authentication/multi-factor/lab-2fa-bypass-using-a-brute-force-attack)
  ([src](src/labs/authentication/2fa_bypass_using_a_brute_force_attack))
* [Brute-forcing a stay-logged-in cookie](https://portswigger.net/web-security/authentication/other-mechanisms/lab-brute-forcing-a-stay-logged-in-cookie)
  ([src](src/labs/authentication/brute_forcing_a_stay_logged_in_cookie))

### Cross-site request forgery (CSRF)
* [CSRF vulnerability with no defenses](https://portswigger.net/web-security/csrf/lab-no-defenses)
  ([src](src/labs/csrf/csrf_vulnerability_with_no_defenses))
* [CSRF where token is not tied to user session](https://portswigger.net/web-security/csrf/bypassing-token-validation/lab-token-not-tied-to-user-session)
  ([src](src/labs/csrf/csrf_where_token_is_not_tied_to_user_session))
* [CSRF where token is tied to non-session cookie](https://portswigger.net/web-security/csrf/bypassing-token-validation/lab-token-tied-to-non-session-cookie)
  ([src](src/labs/csrf/csrf_where_token_is_tied_to_non_session_cookie))
* [CSRF where token validation depends on request method](https://portswigger.net/web-security/csrf/bypassing-token-validation/lab-token-validation-depends-on-request-method)
  ([src](src/labs/csrf/csrf_where_token_validation_depends_on_request_method))
* [CSRF where token validation depends on token being present](https://portswigger.net/web-security/csrf/bypassing-token-validation/lab-token-validation-depends-on-token-being-present)
  ([src](src/labs/csrf/csrf_where_token_validation_depends_on_token_being_present))

### Cross-site scripting (XSS)
* [Reflected XSS into HTML context with nothing encoded](https://portswigger.net/web-security/cross-site-scripting/reflected/lab-html-context-nothing-encoded)
  ([src](src/labs/xss/reflected_xss_into_html_context_with_nothing_encoded))
* [Stored XSS into HTML context with nothing encoded](https://portswigger.net/web-security/cross-site-scripting/stored/lab-html-context-nothing-encoded)
  ([src](src/labs/xss/stored_xss_into_html_context_with_nothing_encoded))

### JWT (JSON Web Token) attacks
* [JWT authentication bypass via flawed signature verification](https://portswigger.net/web-security/jwt/lab-jwt-authentication-bypass-via-flawed-signature-verification)
  ([src](src/labs/jwt/jwt_authentication_bypass_via_flawed_signature_verification))
* [JWT authentication bypass via unverified signature](https://portswigger.net/web-security/jwt/lab-jwt-authentication-bypass-via-unverified-signature)
  ([src](src/labs/jwt/jwt_authentication_bypass_via_unverified_signature))
* [JWT authentication bypass via weak signing key](https://portswigger.net/web-security/jwt/lab-jwt-authentication-bypass-via-weak-signing-key)
  ([src](src/labs/jwt/jwt_authentication_bypass_via_weak_signing_key))
* [JWT authentication bypass via jwk header injection](https://portswigger.net/web-security/jwt/lab-jwt-authentication-bypass-via-jwk-header-injection)
  ([src](src/labs/jwt/jwt_authentication_bypass_via_jwk_header_injection))
* [JWT authentication bypass via jku header injection](https://portswigger.net/web-security/jwt/lab-jwt-authentication-bypass-via-jku-header-injection)
  ([src](src/labs/jwt/jwt_authentication_bypass_via_jku_header_injection))

More to come...



## Installation
The project requires [Node.js](https://nodejs.org/) to be installed.

Install dependencies from the project's root folder:
```shell
npm install
```

## Usage
Run each lab with [tsx](https://tsx.is/):
```console
$ npx tsx .\lab.ts
```

Each lab supports a command-line interface with the `-h` or `--help` option, which shows you how to use the lab and available options.

For example:
```console
$ portswigger_labs\src\labs\authentication\brute_forcing_a_stay_logged_in_cookie> npx tsx .\lab.ts --help
Usage: lab [options] <url>

Lab: Brute-forcing a stay-logged-in cookie

Arguments:
  url                         lab url, https only (e.g. 'https://0a1000e403.web-security-academy.net')

Options:
  -p, --proxy                 use proxy from the config (default: false)
  -c, --concurrency <number>  concurrency limit (default: 5)
  -h, --help                  display help for command
```

### `-p, --proxy` Option: What's Happening Behind the Scenes
Type: `boolean`\
Default: `false`

Use [proxy](https://en.wikipedia.org/wiki/Proxy_server) from the config file.

It helps you clearly see what is happenning during the lab execution, what requests are sent and what responses are received. It's particularly useful for understanding how the lab is solved.

Before using this option, ensure that you have a proxy running. Tested with [mitmproxy](https://github.com/mitmproxy/mitmproxy) (`mitmweb` in specific) and [Burp suite](https://portswigger.net/burp) built-in proxy.

> [!NOTE]
> While it's possible to run the lab with proxy enabled and a concurrency number more than 1, there's no need for this.
> Doing so can make it hard to differentiate which requests/responses belong to wich concurrent tasks. If you use `--proxy` option, make sure `--concurrency` is set to `1`.

The default value is `false`, which means the lab will not use a proxy and all requests/responses will be processed directly.

The proxy configuration is defined in the [proxy.json](/config/proxy.json) file, with the following default values:
```json
{
  "protocol": "https",
  "host": "127.0.0.1",
  "port": 8080
}
```

### `-c, --concurrency <number>` Option
Type: `number`\
Default: `5`

Set the limit of concurrent ***tasks*** that will run during the lab execution.

In this context, a ***task*** refers to a distinct execution flow with its own set of requests/responses.
For example, "Brute-forcing a stay-logged-in cookie" lab supports concurrency and setting `--concurrency` to `2` means that a _maximum_ of 2 tasks will run concurrently.

> [!NOTE]
> `--concurrency` option sets the number of concurrent tasks, not concurrent requests. Each task may involve one or more concurrent requests.

To find out if the lab supports concurrent tasks, invoke the lab with the `--help` option.

## Let's Hack the Site: Walkthrough Example
We will walk through hacking/solving the [Brute-forcing a stay-logged-in cookie lab](https://portswigger.net/web-security/authentication/other-mechanisms/lab-brute-forcing-a-stay-logged-in-cookie).

1. Open the lab link. Here, you can read about the lab and what is needed to solve it.
2. Press "**access the lab**" button. A new browser window will be opened, providing you with a new instance of the vulnerable site.
3. Copy the URL address of the site. For example, it might be something like `https://0ade00bd03624ce5828b88b1001a0082.web-security-academy.net/`
4. Open a terminal window on your computer and navigate to [brute_forcing_a_stay_logged_in_cookie](src/labs/authentication/brute_forcing_a_stay_logged_in_cookie) lab
5. Run the lab with the specified lab URL:
```console
$ portswigger_labs\src\labs\authentication\brute_forcing_a_stay_logged_in_cookie> npx tsx .\lab.ts https://0ade00bd03624ce5828b88b1001a0082.web-security-academy.net/
12345678: fail
123456: fail
password: fail
...
michelle: fail
computer: fail
jessica: success
Login with username "carlos" and password "jessica" to solve the lab
```
6. After the lab.ts finishes execution, follow the instructions provided to complete the final steps.
7. Go to **My account** page and log in with the provided username and password.

> [!NOTE]
> `lab.ts` doesn't fully solve the lab automatically. This is intentional, allowing you to perform the final steps yourself.
8. That's it! ✨ You've successfully hacked the site, and it should indicate that you've solved the lab.

![Walkthrough showcase](https://github.com/iamdenis1234/portswigger-labs/assets/39136616/183083cd-1e91-4cd9-a058-d95fd1bcee36)

## Credits
[jwt.secrets.list](config/jwt.secrets.list) is taken from [this repository](https://github.com/wallarm/jwt-secrets)

