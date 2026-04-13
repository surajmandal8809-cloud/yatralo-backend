const Amadeus = require('amadeus');

const { getSettings } = require("./settings");

let amadeusInstance = null;
let lastUsedClientId = null;
let lastUsedClientSecret = null;

const getAmadeusClient = async () => {
  const settings = await getSettings();
  const { clientId, clientSecret } = settings.amadeus;

  if (amadeusInstance && lastUsedClientId === clientId && lastUsedClientSecret === clientSecret) {
    return amadeusInstance;
  }

  amadeusInstance = new Amadeus({
    clientId: clientId,
    clientSecret: clientSecret
  });
  lastUsedClientId = clientId;
  lastUsedClientSecret = clientSecret;

  return amadeusInstance;
};

module.exports = { getAmadeusClient };

