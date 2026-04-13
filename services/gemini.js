const { GoogleGenerativeAI } = require("@google/generative-ai");
const { getSettings } = require("./settings");

const getGeminiResponse = async (userMessage, chatHistory = []) => {
  try {
    const settings = await getSettings();
    const apiKey = settings.gemini?.apiKey;

    if (!apiKey) {
      throw new Error("Gemini API Key is not configured in Admin Settings.");
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const systemPrompt = `
      You are "Myra", the official smart AI assistant for YatraLo. Your responses must be structured exactly like high-end travel assistants (referencing the MakeMyTrip assistant).

      FORMATTING RULES:
      1. Use **Bold Headlines** for the main subject of your reply.
      2. Use bullet points for steps or lists of instructions.
      3. Keep the language direct, professional, and helpful.
      4. Use blank lines between sections for a clean look.
      5. If providing a link, mention it clearly (e.g., [YatraLo Support]).
      
      BEHAVIOR:
      - For "How to" queries (e.g., how to login, how to book): Provide a clear numbered or bulleted list of steps.
      - For flight searches: Guide the user politely through the necessary fields.
      - Never hallucinate data. If you don't know, suggest checking the FAQ or contacting support.
      
      EXAMPLE RESPONSE STYLE:
      **To log in to YatraLo, please follow these steps:**
      * Visit the **YatraLo website** or app.
      * Click on the **"Login" button** usually found at the top right corner.
      * Enter your registered **email address or mobile number** and password.
      * Click on **"Login"** to access your account.
    `;

    const chat = model.startChat({
      history: [
        { role: "user", parts: [{ text: systemPrompt }] },
        { role: "model", parts: [{ text: "Hi! Welcome to YatraLo ✈️ How can I help you today?" }] },
        ...chatHistory.map(msg => ({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.content }]
        }))
      ],
    });

    const result = await chat.sendMessage(userMessage);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Gemini Service Error:", error.message);
    throw error;
  }
};

module.exports = { getGeminiResponse };
