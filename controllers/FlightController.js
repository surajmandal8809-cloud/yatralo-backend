const Flight = require("../models/Flight");
const { getFlightsByRoute, getFlyingFlights } = require("../services/aviation");
const fs = require("fs");
const path = require("path");

/* ---------------- LOAD AIRPORT DATA ---------------- */

let airportsData = [];

try {
  const airportsPath = path.join(__dirname, "../airports.json");

  if (fs.existsSync(airportsPath)) {
    airportsData = JSON.parse(fs.readFileSync(airportsPath, "utf8"));
  }
} catch (error) {
  console.error("Failed to load airports.json:", error.message);
}

const getAirportByCode = (code) => {
  if (!code) return null;
  return airportsData.find(a => a.iata === code.toUpperCase());
};

/* ---------------- SEARCH FLIGHTS ---------------- */

const searchFlights = async (req, res) => {
  try {
    const { from, to, date, time, max = 20 } = req.query;

    if (!from || !to || !date) {
      return res.status(400).json({
        status: false,
        message: "from, to and date query params are required"
      });
    }

    const limit = Math.min(Math.max(Number(max) || 20, 1), 50);
    const originCode = from.toUpperCase();
    const destCode = to.toUpperCase();

    const query = {
      origin: originCode,
      destination: destCode
    };

    /* ---------- DATE FILTER ---------- */

    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    if (time) {
      const [h, m] = time.split(":");
      const searchTime = new Date(date);
      searchTime.setHours(Number(h), Number(m), 0, 0);
      
      // Look for flights within 12 hours of the requested time if time is specified
      const rangeEnd = new Date(searchTime);
      rangeEnd.setHours(searchTime.getHours() + 12);
      
      query.departureTime = { $gte: searchTime, $lte: rangeEnd };
    } else {
      query.departureTime = { $gte: startOfDay, $lte: endOfDay };
    }

    /* ---------- SEARCH DATABASE ---------- */

    let flights = await Flight.find(query)
      .sort({ departureTime: 1 })
      .limit(limit)
      .lean();

    /* ---------- FETCH FROM AVIATION API IF EMPTY ---------- */

    if (flights.length === 0) {
      console.log(`[FlightSearch] No flights in DB for ${originCode}->${destCode} on ${date}. Fetching from Aviation API...`);

      let apiFlights = [];
      try {
        apiFlights = await getFlightsByRoute(originCode, destCode, date);
      } catch (apiErr) {
        console.error("[FlightSearch] Aviation API failed:", apiErr.message);
      }

      let flightsToSave = [];

      if (apiFlights && apiFlights.length > 0) {
        // Use API Data
        flightsToSave = apiFlights.map(f => {
          const dep = new Date(f.departure?.scheduled || new Date());
          const arr = new Date(f.arrival?.scheduled || new Date());

          // We adjust the date to the searched date but keep the hours/mins from API
          const departureTime = new Date(date);
          departureTime.setHours(dep.getHours(), dep.getMinutes(), 0, 0);

          const arrivalTime = new Date(date);
          // Handle next day arrival
          if (arr < dep) {
             arrivalTime.setDate(arrivalTime.getDate() + 1);
          }
          arrivalTime.setHours(arr.getHours(), arr.getMinutes(), 0, 0);

          return {
            flightNumber: f.flight?.iata || `FL${Math.floor(100 + Math.random() * 900)}`,
            airline: f.airline?.name || "Air Connect",
            origin: originCode,
            destination: destCode,
            departureTime,
            arrivalTime,
            price: Math.floor(Math.random() * 5000) + 3500,
            seatsAvailable: Math.floor(Math.random() * 40) + 5,
            status: "scheduled"
          };
        });
      } else {
        // FALLBACK: Generate realistic flights if API is empty or restricted (common for future dates on free tier)
        console.log(`[FlightSearch] API returned no results for future date ${date}. Generating fallback flights...`);
        
        const airlines = ["Air India", "IndiGo", "Vistara", "SpiceJet", "Akasa Air"];
        const numFlights = 3 + Math.floor(Math.random() * 4); // 3 to 6 flights

        for (let i = 0; i < numFlights; i++) {
          const depHour = 6 + (i * 3) + Math.floor(Math.random() * 2);
          const depMin = Math.floor(Math.random() * 12) * 5;
          const durationMins = 90 + Math.floor(Math.random() * 120);

          const dTime = new Date(date);
          dTime.setHours(depHour, depMin, 0, 0);

          const aTime = new Date(dTime.getTime() + durationMins * 60000);

          flightsToSave.push({
            flightNumber: `${airlines[i % airlines.length].substring(0, 2).toUpperCase()} ${100 + Math.floor(Math.random() * 899)}`,
            airline: airlines[i % airlines.length],
            origin: originCode,
            destination: destCode,
            departureTime: dTime,
            arrivalTime: aTime,
            price: 4500 + Math.floor(Math.random() * 6000),
            seatsAvailable: 20 + Math.floor(Math.random() * 100),
            status: "scheduled"
          });
        }
      }

      if (flightsToSave.length > 0) {
        try {
          // Use insertMany with ordered:false to ignore dupes if they somehow occur
          await Flight.insertMany(flightsToSave, { ordered: false });
          console.log(`[FlightSearch] Saved ${flightsToSave.length} flights to MongoDB for ${originCode}->${destCode}`);
        } catch (dbErr) {
          console.log("[FlightSearch] Note: Some flights might already exist in DB.");
        }

        // Re-query to get exactly what's in DB (including possible existing ones)
        flights = await Flight.find(query)
          .sort({ departureTime: 1 })
          .limit(limit)
          .lean();
      }
    }

    /* ---------- ENRICH AIRPORT DATA ---------- */

    const enrichedFlights = flights.map(f => {
      const originAirport = getAirportByCode(f.origin);
      const destAirport = getAirportByCode(f.destination);

      return {
        ...f,
        originName: originAirport?.name || f.origin,
        originCity: originAirport?.city || f.origin,
        destinationName: destAirport?.name || f.destination,
        destinationCity: destAirport?.city || f.destination
      };
    });

    return res.json({
      status: true,
      count: enrichedFlights.length,
      data: enrichedFlights
    });

  } catch (error) {
    console.error("searchFlights error:", error);
    return res.status(500).json({
      status: false,
      message: "Failed to fetch flights"
    });
  }
};

/* ---------------- SAVE FLIGHTS (MANUAL SYNC) ---------------- */

const saveFlights = async (req, res) => {

  try {

    const { from="DEL", to="BOM" } = req.query;

    const apiFlights = await getFlightsByRoute(from, to);

    const flightsToSave = apiFlights.map(f => ({
      flightNumber: f.flight?.iata,
      airline: f.airline?.name,
      origin: f.departure?.iata || from,
      destination: f.arrival?.iata || to,
      departureTime: f.departure?.scheduled || new Date(),
      arrivalTime: f.arrival?.scheduled || new Date(),
      price: Math.floor(Math.random()*8000) + 3000
    }));

    const saved = await Flight.insertMany(flightsToSave,{ ordered:false });

    return res.json({
      status:true,
      message:"Flights synced",
      count:saved.length
    });

  } catch(error){

    console.error("saveFlights error:", error);

    return res.status(500).json({
      status:false,
      message:"Failed to save flights"
    });

  }
};

/* ---------------- REALTIME FLIGHTS ---------------- */

const getRealtimeFlights = async (req, res) => {

  try {

    const flights = await getFlyingFlights();

    const enriched = flights.map(f => {

      const originAirport = getAirportByCode(f.departure?.iata);
      const destAirport = getAirportByCode(f.arrival?.iata);

      return {
        ...f,
        originName: originAirport?.name || f.departure?.airport,
        destinationName: destAirport?.name || f.arrival?.airport
      };
    });

    return res.json({
      status:true,
      data: enriched
    });

  } catch(error){

    console.error("Realtime flights error:", error);

    return res.status(500).json({
      status:false,
      message:"Failed to fetch realtime flights"
    });

  }
};

module.exports = {
  searchFlights,
  saveFlights,
  getRealtimeFlights
};