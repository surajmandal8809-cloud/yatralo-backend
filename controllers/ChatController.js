const { getGeminiResponse } = require("../services/gemini");

const chatWithAI = async (req, res) => {
  const { message, history } = req.body;

  if (!message) {
    return res.status(400).json({ status: false, message: "Message is required" });
  }

  try {
    const response = await getGeminiResponse(message, history || []);
    return res.json({ status: true, response });
  } catch (error) {
    console.error("Chat Controller Error:", error.message);
    return res.status(500).json({ 
      status: false, 
      message: error.message || "Failed to get AI response" 
    });
  }
};

module.exports = { chatWithAI };
