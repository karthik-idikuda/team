require("dotenv").config();
const express = require("express");
const session = require("express-session");
const path = require("path");
const Orchestrator = require("./ai/orchestrator");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "..", "views"));
app.use(express.static(path.join(__dirname, "..", "public")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: process.env.SESSION_SECRET || "ai-team-secret",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
  })
);

// Helper: get keys (session overrides env)
function getKeys(req) {
  const s = req.session.keys || {};
  return {
    gemini: s.gemini || process.env.GEMINI_API_KEY || "",
    openai: s.openai || process.env.OPENAI_API_KEY || "",
    perplexity: s.perplexity || process.env.PERPLEXITY_API_KEY || "",
    claude: s.claude || process.env.CLAUDE_API_KEY || "",
  };
}

// ========== ROUTES ==========

// Dashboard
app.get("/", (req, res) => {
  const keys = getKeys(req);
  const orchestrator = new Orchestrator(keys);
  res.render("index", { status: orchestrator.getStatus() });
});

// Settings page
app.get("/settings", (req, res) => {
  const keys = getKeys(req);
  const orchestrator = new Orchestrator(keys);
  // Mask keys for display
  const maskedKeys = {};
  for (const [k, v] of Object.entries(keys)) {
    maskedKeys[k] = v && v.length > 8 ? v.slice(0, 6) + "..." + v.slice(-4) : v;
  }
  res.render("settings", {
    status: orchestrator.getStatus(),
    keys: maskedKeys,
    message: req.query.saved ? "Keys saved successfully! Your AI team is connected." : null,
  });
});

// Save keys
app.post("/settings", (req, res) => {
  const { gemini, openai, perplexity, claude } = req.body;
  const current = req.session.keys || {};

  // Only update if new value provided (not masked)
  if (gemini && !gemini.includes("...")) current.gemini = gemini;
  if (openai && !openai.includes("...")) current.openai = openai;
  if (perplexity && !perplexity.includes("...")) current.perplexity = perplexity;
  if (claude && !claude.includes("...")) current.claude = claude;

  req.session.keys = current;
  res.redirect("/settings?saved=1");
});

// Run the AI team
app.post("/api/run", async (req, res) => {
  const { idea } = req.body;
  if (!idea || typeof idea !== "string" || idea.trim().length === 0) {
    return res.json({ success: false, error: "Please enter a project idea" });
  }

  const keys = getKeys(req);
  const orchestrator = new Orchestrator(keys);
  const status = orchestrator.getStatus();

  if (!status.claude) {
    return res.json({
      success: false,
      error: "Claude (Team Lead) is not connected. Please add your Claude API key in Settings.",
    });
  }

  try {
    const results = await orchestrator.runTeam(idea.trim());
    res.json({ success: true, results });
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`
  ╔══════════════════════════════════════════╗
  ║     🤖 AI Team Orchestrator Running     ║
  ║                                          ║
  ║   Dashboard: http://localhost:${PORT}       ║
  ║   Settings:  http://localhost:${PORT}/settings ║
  ╚══════════════════════════════════════════╝
  `);
});
