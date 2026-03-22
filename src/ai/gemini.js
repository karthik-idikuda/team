const { GoogleGenerativeAI } = require("@google/generative-ai");

class GeminiConnector {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.name = "Gemini";
    this.role = "Deep Researcher";
  }

  isConfigured() {
    return this.apiKey && this.apiKey !== "your_gemini_key_here";
  }

  async research(prompt) {
    if (!this.isConfigured()) {
      return { success: false, error: "Gemini API key not configured" };
    }
    try {
      const genAI = new GoogleGenerativeAI(this.apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
      const result = await model.generateContent(prompt);
      const response = result.response;
      return { success: true, data: response.text() };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }
}

module.exports = GeminiConnector;
