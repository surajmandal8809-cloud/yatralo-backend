const BASE_URL = process.env.AVIATION_STACK_BASE_URL;
const API_KEY = process.env.AVIATION_STACK_API_KEY;

/* ---------------- FETCH HELPER ---------------- */

async function aviationFetch(params = {}) {
  try {
    if (!API_KEY || !BASE_URL) {
      throw new Error("AviationStack API key or base URL missing");
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