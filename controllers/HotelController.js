const { amadeus } = require("../services/amadeus");
const HotelSearch = require("../models/HotelSearch");

const searchHotels = async (req, res) => {
    // Extract parameters supporting both naming conventions seen in the frontend
    const cityCode = req.query.cityCode || req.query.destination || req.query.location;
    const checkInDate = req.query.checkInDate || req.query.checkin;
    const checkOutDate = req.query.checkOutDate || req.query.checkout;
    const adults = req.query.adults || req.query.guests;

    if (!cityCode || !checkInDate || !checkOutDate || !adults) {
        return res.status(400).json({
            status: false,
            message: "Missing parameters. Required: cityCode, checkInDate, checkOutDate, adults",
        });
    }

    try {
        // ==============================
        // 🌍 RESOLVE CITY CODE
        // ==============================
        let resolvedCityCode = cityCode;
        if (resolvedCityCode && resolvedCityCode.length !== 3) {
            console.log(`Resolving city name "${resolvedCityCode}" to IATA code...`);
            try {
                const cityResponse = await amadeus.referenceData.locations.get({
                    keyword: resolvedCityCode,
                    subType: 'CITY,AIRPORT'
                });
                if (cityResponse.data && cityResponse.data.length > 0) {
                    resolvedCityCode = cityResponse.data[0].iataCode;
                    console.log(`Resolved "${cityCode}" to "${resolvedCityCode}"`);
                }
            } catch (err) {
                console.error("City resolution failed:", err.message);
            }
        }

        console.log(`Searching hotels in ${resolvedCityCode} (${cityCode}) for ${adults} adults`);

        let hotels = [];
        try {
            // STEP 1: Get list of hotels in the city
            const hotelListResponse = await amadeus.referenceData.locations.hotels.byCity.get({
                cityCode: resolvedCityCode
            });

            if (hotelListResponse.data && hotelListResponse.data.length > 0) {
                // Get up to 20 hotel IDs to avoid overloading the offers search
                const hotelIds = hotelListResponse.data.slice(0, 20).map(h => h.hotelId).join(',');
                console.log(`Found ${hotelListResponse.data.length} hotels, searching offers for top ${Math.min(20, hotelListResponse.data.length)} hotels...`);

                // STEP 2: Get offers for those hotel IDs
                const response = await amadeus.shopping.hotelOffersSearch.get({
                    hotelIds: hotelIds,
                    checkInDate: checkInDate,
                    checkOutDate: checkOutDate,
                    adults: adults
                });

                if (response.data && response.data.length > 0) {
                    console.log("Amadeus API response received. Data length:", response.data.length);
                    
                    const hotelImages = [
                        "/assets/img/hotels/hotel_luxury_room_1.png",
                        "/assets/img/hotels/hotel_lobby_2.png",
                        "/assets/img/hotels/hotel_pool_3.png",
                        "/assets/img/hotels/hotel_facade_4.png"
                    ];

                    hotels = response.data.map((offer, index) => {
                        const hotel = offer.hotel;
                        const allOffers = offer.offers || [];
                        const firstOffer = allOffers[0] || {};
                        
                        const priceVal = firstOffer.price ? parseFloat(firstOffer.price.total) : 0;
                        const currency = firstOffer.price ? (firstOffer.price.currency || "EUR") : "EUR";
                        
                        let priceInINR = priceVal;
                        if (currency !== "INR") {
                            priceInINR = Math.round(priceVal * 83);
                        } else {
                            priceInINR = Math.round(priceVal);
                        }

                        return {
                            id: hotel.hotelId,
                            name: hotel.name,
                            address: hotel.address ? `${hotel.address.lines?.join(', ') || ''}` : 'Address N/A',
                            city: hotel.cityCode,
                            price: priceInINR || (Math.floor(Math.random() * 5000) + 3000), 
                            currency: "INR",
                            rating: hotel.rating || (3 + Math.floor(Math.random() * 2)),
                            description: (hotel.description && hotel.description.text) || 
                                         "Experience premium comfort and luxury at " + hotel.name + ". Centrally located with world-class amenities and exceptional service.",
                            amenities: hotel.amenities || ["WIFI", "BREAKFAST", "PARKING", "RESTAURANT", "AIR_CONDITIONING"],
                            images: [hotelImages[index % hotelImages.length]], 
                            location: {
                                lat: hotel.latitude,
                                lng: hotel.longitude
                            },
                            contact: hotel.contact || {},
                            allOffers: allOffers.map(o => ({
                                roomType: o.room?.typeEstimated?.category || "Standard Room",
                                roomDescription: o.room?.description?.text || "Comfortable guest room",
                                price: (o.price?.currency === "INR" ? Math.round(o.price.total) : Math.round(o.price?.total * 83)) || priceInINR,
                                policies: o.policies || {}
                            }))
                        };
                    });
                }
            }
        } catch (apiError) {
            console.error("Amadeus API Specific Error:", apiError.code, apiError.response ? apiError.response.body : apiError.message);
        }

        // ==============================
        // 💾 FALLBACK & LOGGING
        // ==============================
        if (hotels.length === 0) {
            console.log(`No Amadeus results. Providing mock fallback for ${resolvedCityCode}.`);
            hotels = [
                {
                    id: "MOCK_" + resolvedCityCode + "_1",
                    name: "The Royal " + resolvedCityCode + " Regency",
                    address: "Main Square, " + resolvedCityCode,
                    city: resolvedCityCode,
                    price: 5200,
                    rating: 4.7,
                    description: "Experience premium comfort and luxury. Centrally located with world-class amenities.",
                    amenities: ["WIFI", "BREAKFAST", "POOL", "GYM", "ROOM_SERVICE"],
                    images: ["/assets/img/hotels/hotel_luxury_room_1.png"],
                    location: { lat: 0, lng: 0 },
                    allOffers: [{ roomType: "Deluxe King Room", roomDescription: "Spacious room with king bed", price: 5200 }]
                },
                {
                    id: "MOCK_" + resolvedCityCode + "_2",
                    name: "City Comfort Inn " + resolvedCityCode,
                    address: "Airport Road, " + resolvedCityCode,
                    city: resolvedCityCode,
                    price: 2800,
                    rating: 4.1,
                    description: "Modern budget-friendly stay with easy access to the city center.",
                    amenities: ["WIFI", "BREAKFAST", "PARKING"],
                    images: ["/assets/img/hotels/hotel_lobby_2.png"],
                    location: { lat: 0, lng: 0 },
                    allOffers: [{ roomType: "Standard Queen Room", roomDescription: "Comfortable room for two", price: 2800 }]
                }
            ];
        }

        // Save search log to MongoDB (as requested by user)
        try {
            await HotelSearch.create({
                city: cityCode,
                cityCode: resolvedCityCode,
                checkInDate: checkInDate,
                checkOutDate: checkOutDate,
                guests: parseInt(adults),
                resultsCount: hotels.length
            });
        } catch (dbErr) {
            console.error("Failed to save hotel search log:", dbErr.message);
        }

        console.log("Final Hotels Data to Client:", JSON.stringify(hotels, null, 2));
        console.log(`Sending ${hotels.length} hotels to client.`);
        return res.json({
            status: true,
            data: hotels,
            source: hotels[0].id.startsWith("MOCK") ? "fallback" : "amadeus"
        });
    } catch (error) {
        console.error("Hotel Search Execution Error:", error);
        return res.status(500).json({
            status: false,
            message: "Something went wrong during hotel search.",
            error: error.message
        });
    }
};

const saveHotelSearch = async (req, res) => {
    try {
        const { destination, checkin, checkout, guests } = req.body;

        if (!destination || !checkin || !checkout || !guests) {
            return res.status(400).json({
                status: false,
                message: "All fields required",
            });
        }

        const data = await HotelSearch.create({
            city: destination,
            checkInDate: checkin,
            checkOutDate: checkout,
            guests,
        });

        res.json({
            status: true,
            data,
        });
    } catch (error) {
        res.status(500).json({
            status: false,
            message: "Failed to save",
        });
    }
};

const getHotelCitySuggestions = async (req, res) => {
    try {
        const { keyword } = req.query;

        if (!keyword || keyword.length < 2) {
            return res.json({ status: true, data: [] });
        }

        const response = await amadeus.referenceData.locations.get({
            keyword,
            subType: "CITY,AIRPORT"
        });

        const data = response.data.map((item) => ({
            city: item.address.cityName || item.name,
            iataCode: item.iataCode,
            country: item.address.countryName,
        }));

        res.json({ status: true, data });
    } catch (error) {
        res.status(500).json({
            status: false,
            message: "Error fetching suggestions",
        });
    }
};

module.exports = {
    searchHotels,
    saveHotelSearch,
    getHotelCitySuggestions,
};