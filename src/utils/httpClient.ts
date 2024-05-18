import axios from "axios";
import https from "https";
import { getProxy } from "../config/getProxy.js";

export { getHttpClient };

const proxy = await getProxy();

// TODO: rename file to getHttpClient
function getHttpClient(config: { useProxy: boolean }) {
  // for performance and https support via proxy
  const httpsAgent = new https.Agent({
    // see https://nodejs.org/api/http.html#new-agentoptions for relevant explanations
    maxSockets: 100,
    // to support self-signed proxy certificate
    // see https://nodejs.org/api/tls.html#tlscreateserveroptions-secureconnectionlistener for details
    rejectUnauthorized: false,
  });

  const instance = axios.create({
    httpsAgent: httpsAgent,
    proxy: config.useProxy && proxy,
    maxRedirects: 0,
    validateStatus: (status) => {
      return status >= 200 && status < 500;
    },
  });

  instance.interceptors.response.use(null, (error) => {
    if (error.response?.status === 504) {
      console.log("Looks like your lab time has expired");
    }
    if (error.code === "ECONNREFUSED") {
      console.log("Looks like your proxy is not working");
    }
    if (error.code === "ETIMEDOUT") {
      console.log("Looks like you have set the concurrency level too high");
    }
    throw error;
  });

  return instance;
}
