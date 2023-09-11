import axios from "axios";
import https from "https";
import { getProxy } from "./config.js";

export { getHttpClient };

const proxy = await getProxy();

function getHttpClient(config = {}) {
  // for performance and https support via proxy
  const httpsAgent = new https.Agent({
    // see https://nodejs.org/api/http.html#new-agentoptions for relevant explanations
    keepAlive: true,
    maxSockets: 100,
    // to support self-signed proxy certificate
    // see https://nodejs.org/api/tls.html#tlscreateserveroptions-secureconnectionlistener for details
    rejectUnauthorized: false,
  });

  return axios.create({
    httpsAgent: httpsAgent,
    proxy: config.useProxy && proxy,
    maxRedirects: 0,
    validateStatus: (status) => {
      return status >= 200 && status < 500;
    },
  });
}
