const GeminiConnector = require("./gemini");
const ChatGPTConnector = require("./chatgpt");
const PerplexityConnector = require("./perplexity");
const ClaudeConnector = require("./claude");

class Orchestrator {
  constructor(keys) {
    this.gemini = new GeminiConnector(keys.gemini);
    this.chatgpt = new ChatGPTConnector(keys.openai);
    this.perplexity = new PerplexityConnector(keys.perplexity);
    this.claude = new ClaudeConnector(keys.claude);
  }

  getStatus() {
    return {
      gemini: this.gemini.isConfigured(),
      chatgpt: this.chatgpt.isConfigured(),
      perplexity: this.perplexity.isConfigured(),
      claude: this.claude.isConfigured(),
    };
  }

  async runTeam(userIdea, onProgress) {
    const results = {};
    const log = (agent, status, msg) => {
      if (onProgress) onProgress({ agent, status, message: msg });
    };

    // ========== STEP 1: Claude analyzes the idea and creates prompts ==========
    log("claude", "working", "Analyzing your idea and creating prompts for the team...");

    const coordinatorPrompt = `You are the Team Lead AI Coordinator. A user has submitted a project idea. Your job is to:

1. Analyze the idea thoroughly
2. Create SPECIFIC, DETAILED prompts for each team member:
   - **Gemini (Deep Researcher)**: What should Gemini research deeply? (market analysis, competitors, technical feasibility, user demographics, trends)
   - **Perplexity (Data Finder)**: What specific facts, statistics, data points, and real-world examples should Perplexity find?
   - **ChatGPT (Logic & Architecture)**: What logical analysis, technical architecture, system design, and project structure should ChatGPT work on?

Return your response in this EXACT format:

## IDEA ANALYSIS
[Your analysis of the idea - strengths, challenges, viability]

## PROMPT FOR GEMINI (Deep Research)
[Detailed research prompt]

## PROMPT FOR PERPLEXITY (Data & Facts)
[Detailed data-finding prompt]

## PROMPT FOR CHATGPT (Logic & Architecture)
[Detailed architecture/logic prompt]

USER'S IDEA: ${userIdea}`;

    const claudeStep1 = await this.claude.coordinate(coordinatorPrompt);
    if (!claudeStep1.success) {
      results.coordinator = { error: claudeStep1.error };
      return results;
    }
    results.coordinator = claudeStep1.data;
    log("claude", "done", "Prompts created! Dispatching to team...");

    // ========== STEP 2: Parse prompts and send to each AI in parallel ==========
    const prompts = this._parsePrompts(claudeStep1.data, userIdea);

    const tasks = [];

    // Gemini - Deep Research
    if (this.gemini.isConfigured()) {
      log("gemini", "working", "Deep researching...");
      tasks.push(
        this.gemini.research(prompts.gemini).then((r) => {
          log("gemini", r.success ? "done" : "error", r.success ? "Research complete!" : r.error);
          results.gemini = r.success ? r.data : `Error: ${r.error}`;
        })
      );
    } else {
      results.gemini = "Not configured - add your Gemini API key in Settings";
    }

    // Perplexity - Data & Facts
    if (this.perplexity.isConfigured()) {
      log("perplexity", "working", "Gathering data and facts...");
      tasks.push(
        this.perplexity.search(prompts.perplexity).then((r) => {
          log("perplexity", r.success ? "done" : "error", r.success ? "Data gathered!" : r.error);
          results.perplexity = r.success ? r.data : `Error: ${r.error}`;
        })
      );
    } else {
      results.perplexity = "Not configured - add your Perplexity API key in Settings";
    }

    // ChatGPT - Logic & Architecture
    if (this.chatgpt.isConfigured()) {
      log("chatgpt", "working", "Designing architecture and logic...");
      tasks.push(
        this.chatgpt.analyze(prompts.chatgpt).then((r) => {
          log("chatgpt", r.success ? "done" : "error", r.success ? "Architecture ready!" : r.error);
          results.chatgpt = r.success ? r.data : `Error: ${r.error}`;
        })
      );
    } else {
      results.chatgpt = "Not configured - add your OpenAI API key in Settings";
    }

    await Promise.all(tasks);

    // ========== STEP 3: Claude combines everything into final output ==========
    log("claude", "working", "Combining all research into final project plan...");

    const finalPrompt = `You are the Team Lead AI. Your team has completed their research on this project idea:

"${userIdea}"

Here are the results from each team member:

## GEMINI'S DEEP RESEARCH:
${results.gemini || "Not available"}

## PERPLEXITY'S DATA & FACTS:
${results.perplexity || "Not available"}

## CHATGPT'S ARCHITECTURE & LOGIC:
${results.chatgpt || "Not available"}

Now, synthesize ALL of this into a comprehensive final deliverable:

# FINAL PROJECT PLAN

## 1. Executive Summary
[Brief overview of the project]

## 2. Market Research Summary
[Key findings from research]

## 3. Technical Architecture
[System design, tech stack, components]

## 4. Project Structure
[Folder structure, modules, files needed]

## 5. Implementation Roadmap
[Phase-by-phase plan with milestones]

## 6. Key Risks & Mitigations
[What could go wrong and how to prevent it]

## 7. Estimated Timeline & Resources
[Realistic timeline and what's needed]

Make it actionable and specific - the user should be able to start building immediately from this plan.`;

    const finalResult = await this.claude.coordinate(finalPrompt);
    if (finalResult.success) {
      results.finalPlan = finalResult.data;
      log("claude", "done", "Final project plan ready!");
    } else {
      results.finalPlan = `Error creating final plan: ${finalResult.error}`;
      log("claude", "error", finalResult.error);
    }

    return results;
  }

  _parsePrompts(claudeResponse, originalIdea) {
    const defaults = {
      gemini: `Do deep research on this project idea. Analyze market size, competitors, target audience, technical feasibility, current trends, and potential challenges: ${originalIdea}`,
      perplexity: `Find specific data, statistics, real-world examples, and current facts related to this project idea. Include market data, user statistics, pricing benchmarks, and relevant case studies: ${originalIdea}`,
      chatgpt: `Design a complete technical architecture for this project idea. Include system design, tech stack recommendations, database schema, API design, folder structure, and implementation approach: ${originalIdea}`,
    };

    try {
      const geminiMatch = claudeResponse.match(/## PROMPT FOR GEMINI.*?\n([\s\S]*?)(?=## PROMPT FOR|$)/i);
      const perplexityMatch = claudeResponse.match(/## PROMPT FOR PERPLEXITY.*?\n([\s\S]*?)(?=## PROMPT FOR|$)/i);
      const chatgptMatch = claudeResponse.match(/## PROMPT FOR CHATGPT.*?\n([\s\S]*?)$/i);

      return {
        gemini: geminiMatch ? geminiMatch[1].trim() : defaults.gemini,
        perplexity: perplexityMatch ? perplexityMatch[1].trim() : defaults.perplexity,
        chatgpt: chatgptMatch ? chatgptMatch[1].trim() : defaults.chatgpt,
      };
    } catch {
      return defaults;
    }
  }
}

module.exports = Orchestrator;
