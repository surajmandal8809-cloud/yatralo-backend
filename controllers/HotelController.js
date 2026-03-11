const { searchHotels: findHotels } = require("../services/amadeus");

const searchHotels = async (req, res) => {
    try {
        const { cityCode, checkInDate, checkOutDate, adults = 1, rooms = 1 } = req.query;

        if (!cityCode || !checkInDate || !checkOutDate) {
            return res.status(400).json({
                status: false,
                message: "cityCode, checkInDate, and checkOutDate are required.",
            });
        }

        const hotels = await findHotels({
            cityCode: String(cityCode).toUpperCase(),
            checkInDate,
            checkOutDate,
            adults: Number(adults),
            rooms: Number(rooms),
        });

        return res.status(200).json({
            status: true,
            message: "Hotel offers fetched successfully.",
            data: hotels,
        });
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: error.message || "Failed to fetch hotel offers.",
        });
    }
};

module.exports = {
    searchHotels,
};
