
const searchBuses = async (req, res) => {
    try {
        const { from, to, date } = req.query;

        if (!from || !to || !date) {
            return res.status(400).json({
                status: false,
                message: "from, to, and date are required.",
            });
        }

        const buses = generateMockBuses(from, to, date);

        return res.status(200).json({
            status: true,
            message: "Bus search completed successfully.",
            data: buses,
        });
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: error.message || "Failed to search buses.",
        });
    }
};

module.exports = {
    searchBuses,
};
