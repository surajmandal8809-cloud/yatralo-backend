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
                    
                    // STEP 3: Get Media (Images) for those hotel IDs
                    let mediaMap = {};
                    try {
                        const mediaResponse = await amadeus.shopping.hotelMedia.get({
                            hotelIds: hotelIds
                        });
                        if (mediaResponse.data) {
                            mediaResponse.data.forEach(m => {
                                mediaMap[m.hotelId] = m.media?.map(item => item.uri) || [];
                            });
                        }
                    } catch (mediaErr) {
                        console.error("Media fetch failed:", mediaErr.message);
                    }

                    const fallbackImages = [
                        "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80",
                        "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80",
                        "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80"
                    ];

                    hotels = response.data.map((offer, index) => {
                        const hotel = offer.hotel;
                        const hotelMedia = mediaMap[hotel.hotelId] || [];
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
                            city: hotel.address?.cityName || hotel.cityCode,
                            country: hotel.address?.countryCode,
                            price: priceInINR || (Math.floor(Math.random() * 5000) + 3000), 
                            currency: "INR",
                            rating: (hotel.rating || 4),
                            description: (hotel.description && hotel.description.text) || 
                                         "Experience premium luxury at " + hotel.name + ". Centrally located with world-class amenities and exceptional service.",
                            amenities: hotel.amenities || ["WIFI", "BREAKFAST", "PARKING", "RESTAURANT", "AIR_CONDITIONING"],
                            images: hotelMedia.length > 0 ? hotelMedia : [fallbackImages[index % fallbackImages.length]], 
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
                    name: "Grand Palace Hotel & Resort",
                    address: "Civic Center, Central Business District",
                    city: resolvedCityCode,
                    country: "India",
                    price: 4999,
                    currency: "INR",
                    rating: 4.5,
                    description: "Experience the epitome of luxury and world-class hospitality at Grand Palace Hotel.",
                    amenities: ["WIFI", "POOL", "GYM", "SPA", "RESTAURANT"],
                    images: ["https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80"]
                },
                {
                    id: "MOCK_" + resolvedCityCode + "_2",
                    name: "Azure Boutique Stay",
                    address: "North Shore, Coastal Road",
                    city: resolvedCityCode,
                    country: "India",
                    price: 3499,
                    currency: "INR",
                    rating: 4.2,
                    description: "A stylish and contemporary boutique hotel overlooking the scenic bay.",
                    amenities: ["WIFI", "BAR", "PARKING", "AIR_CONDITIONING"],
                    images: ["https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80"]
                }
            ];
        }

        res.json({
            status: true,
            data: hotels,
            source: hotels[0].id.startsWith("MOCK") ? "mock" : "amadeus"
        });

    } catch (error) {
        console.error("Search hotels error:", error.message);
        res.status(500).json({ status: false, message: "Server error" });
    }
};

const saveHotelSearch = async (req, res) => {
    try {
        const hotelSearch = new HotelSearch({
            ...req.body,
            userId: req.user ? req.user.id : null,
        });
        await hotelSearch.save();
        res.status(201).json({ status: true, data: hotelSearch });
    } catch (error) {
        res.status(500).json({ status: false, message: "Error saving search" });
    }
};

const getHotelCitySuggestions = async (req, res) => {
    const { keyword } = req.query;
    if (!keyword) return res.status(400).json({ status: false, message: "Keyword is required" });

    try {
        const response = await amadeus.referenceData.locations.get({
            keyword,
            subType: 'CITY',
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

const getHotelIdDetails = async (req, res) => {
    const { hotelId } = req.params;
    const { checkInDate, checkOutDate, adults } = req.query;

    if (!hotelId || !checkInDate || !checkOutDate || !adults) {
        return res.status(400).json({
            status: false,
            message: "Missing parameters. Required: hotelId, checkInDate, checkOutDate, adults",
        });
    }

    try {
        console.log(`Fetching specific offers for Hotel ID: ${hotelId}`);
        const response = await amadeus.shopping.hotelOffersSearch.get({
            hotelIds: hotelId,
            checkInDate,
            checkOutDate,
            adults
        });

        if (response.data && response.data.length > 0) {
            const offer = response.data[0];
            const hotel = offer.hotel;
            const allOffers = offer.offers || [];
            const firstOffer = allOffers[0] || {};
            
            const priceVal = firstOffer.price ? parseFloat(firstOffer.price.total) : 0;
            const currency = firstOffer.price ? (firstOffer.price.currency || "EUR") : "EUR";
            const priceInINR = currency !== "INR" ? Math.round(priceVal * 83) : Math.round(priceVal);

            // Fetch Media before creating the result object
            let hotelMedia = [];
            try {
                const mediaResponse = await amadeus.shopping.hotelMedia.get({
                    hotelIds: hotelId
                });
                if (mediaResponse.data && mediaResponse.data.length > 0) {
                    hotelMedia = mediaResponse.data[0].media?.map(item => item.uri) || [];
                }
            } catch (mediaErr) {
                console.error("Single hotel media fetch failed:", mediaErr.message);
            }

            const result = {
                id: hotel.hotelId,
                name: hotel.name,
                address: hotel.address ? `${hotel.address.lines?.join(', ') || ''}` : 'Address N/A',
                city: hotel.address?.cityName || hotel.cityCode,
                country: hotel.address?.countryCode,
                price: priceInINR,
                currency: "INR",
                rating: hotel.rating || (3 + Math.floor(Math.random() * 2)),
                description: (hotel.description && hotel.description.text) || "Premium comfort and luxury.",
                amenities: hotel.amenities || ["WIFI", "BREAKFAST", "PARKING"],
                images: hotelMedia.length > 0 ? hotelMedia : [
                    "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80",
                    "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80"
                ],
                allOffers: allOffers.map(o => ({
                    roomType: o.room?.typeEstimated?.category || "Standard Room",
                    roomDescription: o.room?.description?.text || "Comfortable guest room",
                    price: (o.price?.currency === "INR" ? Math.round(o.price.total) : Math.round(o.price?.total * 83)) || priceInINR,
                }))
            };

            return res.json({ status: true, data: result });
        }

        res.status(404).json({ status: false, message: "Hotel offers not found" });
    } catch (error) {
        console.error("Get hotel ID details error:", error.message);
        res.status(500).json({ status: false, message: "Server error" });
    }
};

module.exports = {
    searchHotels,
    saveHotelSearch,
    getHotelCitySuggestions,
    getHotelIdDetails
};