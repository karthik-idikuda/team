const Anthropic = require("@anthropic-ai/sdk");

class ClaudeConnector {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.name = "Claude";
    this.role = "Team Lead & Coordinator";
  }

  isConfigured() {
    return this.apiKey && this.apiKey !== "your_claude_key_here";
  }

  async coordinate(prompt) {
    if (!this.isConfigured()) {
      return { success: false, error: "Claude API key not configured" };
    }
    try {
      const client = new Anthropic({ apiKey: this.apiKey });
      const message = await client.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 4096,
        messages: [{ role: "user", content: prompt }],
      });
      return { success: true, data: message.content[0].text };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }
}

module.exports = ClaudeConnector;
