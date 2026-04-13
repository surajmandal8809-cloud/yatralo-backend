const { getSettings } = require("./settings");

const BASE_URL_DEFAULT = "https://api.aviationstack.com/v1/flights";

/* ---------------- FETCH HELPER ---------------- */

async function aviationFetch(params = {}) {
  try {
    const settings = await getSettings();
    const API_KEY = settings?.aviationStack?.apiKey;
    const BASE_URL = process.env.AVIATION_STACK_BASE_URL || BASE_URL_DEFAULT;

    if (!API_KEY) {
      throw new Error("AviationStack API key missing");
    }

    const query = new URLSearchParams({
      access_key: API_KEY,
      ...params
    });

    const url = `${BASE_URL}?${query.toString()}`;

    const res = await fetch(url);

    if (!res.ok) {
      throw new Error(`Aviation API error ${res.status}`);
    }

    const data = await res.json();

    if (data?.error) {
      console.error("AviationStack error:", data.error);
      return [];
    }

    return data?.data || [];

  } catch (error) {
    console.error("Aviation fetch error:", error.message);
    return [];
  }
}

/* ---------------- REALTIME ACTIVE FLIGHTS ---------------- */

async function getFlyingFlights() {
  try {

    const flights = await aviationFetch();

    return flights.filter(
      (flight) => flight.flight_status === "active"
    );

  } catch (error) {
    console.error("getFlyingFlights error:", error);
    return [];
  }
}

/* ---------------- ROUTE SEARCH ---------------- */

async function getFlightsByRoute(from, to, date) {

  try {

    const params = {
      dep_iata: from,
      arr_iata: to
    };

    if (date) {
      params.flight_date = date;
    }

    const flights = await aviationFetch(params);

    return flights;

  } catch (error) {
    console.error("getFlightsByRoute error:", error);
    return [];
  }
}

module.exports = {
  getFlyingFlights,
  getFlightsByRoute
};