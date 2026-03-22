const OpenAI = require("openai");

class PerplexityConnector {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.name = "Perplexity";
    this.role = "Data & Facts Researcher";
  }

  isConfigured() {
    return this.apiKey && this.apiKey !== "your_perplexity_key_here";
  }

  async search(prompt) {
    if (!this.isConfigured()) {
      return { success: false, error: "Perplexity API key not configured" };
    }
    try {
      const client = new OpenAI({
        apiKey: this.apiKey,
        baseURL: "https://api.perplexity.ai",
      });
      const completion = await client.chat.completions.create({
        model: "sonar",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 4096,
      });
      return { success: true, data: completion.choices[0].message.content };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }
}

module.exports = PerplexityConnector;
