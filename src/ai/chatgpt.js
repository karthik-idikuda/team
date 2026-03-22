const OpenAI = require("openai");

class ChatGPTConnector {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.name = "ChatGPT";
    this.role = "Logic & Architecture";
  }

  isConfigured() {
    return this.apiKey && this.apiKey !== "your_openai_key_here";
  }

  async analyze(prompt) {
    if (!this.isConfigured()) {
      return { success: false, error: "OpenAI API key not configured" };
    }
    try {
      const openai = new OpenAI({ apiKey: this.apiKey });
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 4096,
      });
      return { success: true, data: completion.choices[0].message.content };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }
}

module.exports = ChatGPTConnector;
