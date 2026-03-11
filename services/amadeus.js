const AMADEUS_BASE_URL = process.env.AMADEUS_BASE_URL || "https://test.api.amadeus.com";

let tokenCache = {
  token: null,
  expiresAt: 0,
};

const parseIsoDurationToMinutes = (isoDuration = "") => {
  const hoursMatch = isoDuration.match(/(\d+)H/);
  const minutesMatch = isoDuration.match(/(\d+)M/);
  const hours = hoursMatch ? Number(hoursMatch[1]) : 0;
  const minutes = minutesMatch ? Number(minutesMatch[1]) : 0;
  return hours * 60 + minutes;
};

const toTime = (dateTime) => {
  if (!dateTime) return "";
  const value = new Date(dateTime);
  if (Number.isNaN(value.getTime())) return "";
  return `${String(value.getHours()).padStart(2, "0")}:${String(value.getMinutes()).padStart(2, "0")}`;
};

const getAccessToken = async () => {
  const now = Date.now();
  if (tokenCache.token && tokenCache.expiresAt > now + 15_000) {
    return tokenCache.token;
  }

  const clientId = process.env.AMADEUS_CLIENT_ID;
  const clientSecret = process.env.AMADEUS_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("Amadeus credentials are not configured.");
  }

  const response = await fetch(`${AMADEUS_BASE_URL}/v1/security/oauth2/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: clientId,
      client_secret: clientSecret,
    }),
  });

  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload?.error_description || "Failed to authenticate with Amadeus.");
  }

  tokenCache = {
    token: payload.access_token,
    expiresAt: now + Number(payload.expires_in || 0) * 1000,
  };

  return tokenCache.token;
};

const searchFlightOffers = async ({
  originLocationCode,
  destinationLocationCode,
  departureDate,
  adults = 1,
  max = 20,
  nonStop = false,
  currencyCode = "INR",
}) => {
  const token = await getAccessToken();

  const params = new URLSearchParams({
    originLocationCode,
    destinationLocationCode,
    departureDate,
    adults: String(adults),
    max: String(max),
    nonStop: String(Boolean(nonStop)),
    currencyCode,
  });

  const response = await fetch(`${AMADEUS_BASE_URL}/v2/shopping/flight-offers?${params.toString()}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const payload = await response.json();

  if (!response.ok) {
    const details = payload?.errors?.[0]?.detail || payload?.errors?.[0]?.title;
    throw new Error(details || "Unable to fetch flight offers.");
  }

  const carriers = payload?.dictionaries?.carriers || {};
  const offers = payload?.data || [];

  return offers.map((offer, index) => {
    const itinerary = offer.itineraries?.[0];
    const segments = itinerary?.segments || [];
    const firstSegment = segments[0];
    const lastSegment = segments[segments.length - 1];

    const carrierCode = firstSegment?.carrierCode || offer.validatingAirlineCodes?.[0] || "XX";
    const airlineName = carriers[carrierCode] || carrierCode;
    const durationMinutes = parseIsoDurationToMinutes(itinerary?.duration || "PT0M");
    const grandTotal = Number(offer?.price?.grandTotal || 0);
    const seats = Number(offer?.numberOfBookableSeats || 0);

    return {
      id: offer.id || `offer-${index}`,
      airline: airlineName,
      code: carrierCode,
      bg: "#1e3766",
      flightNo: `${carrierCode}${firstSegment?.number || ""}`,
      dep: toTime(firstSegment?.departure?.at),
      arr: toTime(lastSegment?.arrival?.at),
      depMins: (() => {
        if (!firstSegment?.departure?.at) return 0;
        const date = new Date(firstSegment.departure.at);
        return date.getHours() * 60 + date.getMinutes();
      })(),
      duration: durationMinutes,
      stops: Math.max(0, segments.length - 1),
      price: Math.round(grandTotal),
      perPax: Math.round(grandTotal / Math.max(1, Number(adults))),
      seats,
      wifi: false,
      meal: false,
      refundable: offer?.pricingOptions?.includedCheckedBagsOnly === false,
      rating: "4.2",
    };
  });
};

const searchCities = async (keyword) => {
  const token = await getAccessToken();
  const params = new URLSearchParams({
    subType: "CITY,AIRPORT",
    keyword,
    "page[limit]": "10",
  });

  const response = await fetch(`${AMADEUS_BASE_URL}/v1/reference-data/locations?${params.toString()}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload?.errors?.[0]?.detail || "Failed to search cities.");
  }

  return (payload.data || []).map((loc) => ({
    code: loc.iataCode,
    name: loc.address.cityName,
    airport: loc.name,
    country: loc.address.countryName,
  }));
};

const searchHotels = async ({ cityCode, checkInDate, checkOutDate, adults = 1, rooms = 1 }) => {
  const token = await getAccessToken();

  // Step 1: Get hotel IDs in the city
  const listParams = new URLSearchParams({
    cityCode,
    radius: "5",
    radiusUnit: "KM",
    hotelSource: "ALL",
  });

  const listResponse = await fetch(`${AMADEUS_BASE_URL}/v1/reference-data/locations/hotels/by-city?${listParams.toString()}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const listPayload = await listResponse.json();
  if (!listResponse.ok) {
    throw new Error(listPayload?.errors?.[0]?.detail || "Failed to fetch hotels list.");
  }

  const hotelIds = (listPayload.data || []).slice(0, 50).map((h) => h.hotelId);
  if (hotelIds.length === 0) return [];

  // Step 2: Get offers for those hotels
  const offerParams = new URLSearchParams({
    hotelIds: hotelIds.join(","),
    adults: String(adults),
    checkInDate,
    checkOutDate,
    roomQuantity: String(rooms),
    currency: "INR",
  });

  const offerResponse = await fetch(`${AMADEUS_BASE_URL}/v3/shopping/hotel-offers?${offerParams.toString()}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const offerPayload = await offerResponse.json();
  if (!offerResponse.ok) {
    // Sometimes hotel-offers fails if hotelIds are too many or invalid in test env
    // We try to return an empty list or handle gracefully
    return [];
  }

  return (offerPayload.data || []).map((item) => {
    const hotel = item.hotel;
    const offer = item.offers?.[0];
    return {
      id: hotel.hotelId,
      name: hotel.name,
      rating: "4.5", // Mock rating as it's often missing in test env
      address: hotel.address?.lines?.join(", ") || "",
      city: hotel.address?.cityName,
      price: Math.round(Number(offer?.price?.total || 0)),
      currency: offer?.price?.currency || "INR",
      description: offer?.room?.description?.text || "Luxurious stay with modern amenities.",
      images: [
        `https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80`,
        `https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80`
      ],
      amenities: offer?.room?.typeEstimated?.amenities || ["WiFi", "Pool", "Gym"],
    };
  });
};

module.exports = {
  searchFlightOffers,
  searchCities,
  searchHotels,
};
