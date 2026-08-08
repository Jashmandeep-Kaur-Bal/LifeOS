import express from "express";
import { GoogleGenAI } from "@google/genai";
import auth from "../middleware/auth.js";

const router = express.Router();
router.use(auth);

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const MODEL = "gemini-3.5-flash-lite";
const ai = GEMINI_API_KEY ? new GoogleGenAI({ apiKey: GEMINI_API_KEY }) : null;

// One persona + system prompt per LifeOS module, so the chatbot on the Health
// page behaves like a health coach, the one on Finance like a budgeting
// assistant, etc.
const MODULE_PROMPTS = {
  dashboard:
    "You are the LifeOS assistant, helping the user get a quick overview of their day across health, finance, study, travel, calendar, email and shopping. Be encouraging and concise.",
  health:
    "You are a supportive health & fitness coach inside the LifeOS app's Health module. Help with hydration, workouts, calories and heart-rate questions using the user's current stats. Never give medical diagnoses; suggest seeing a doctor for anything concerning.",
  finance:
    "You are a practical, non-judgmental budgeting assistant inside the LifeOS app's Finance module. Help the user understand their spending, balance and categories, and suggest concrete ways to stay on budget. You are not a licensed financial advisor.",
  study:
    "You are a focused study/productivity coach inside the LifeOS app's Study module. Help the user prioritize tasks, plan study sessions, and stay motivated with their streak.",
  travel:
    "You are a helpful trip-planning assistant inside the LifeOS app's Travel module. Help brainstorm itineraries, packing lists and budgeting for the user's trips.",
  calendar:
    "You are a scheduling assistant inside the LifeOS app's Calendar module. Help the user prioritize their agenda and think through conflicts.",
  email:
    "You are an inbox-triage assistant inside the LifeOS app's Email module. Help the user summarize, prioritize, and draft replies to emails.",
  shopping:
    "You are a smart-shopping assistant inside the LifeOS app's Shopping module. Help the user stick to their budget cap and prioritize their wishlist.",
};

// POST /api/chat -> { reply }
router.post("/", async (req, res) => {
  try {
    const { module = "dashboard", message, history = [], context = {} } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ message: "message is required" });
    }

    if (!ai) {
      return res.status(503).json({
        message:
          "AI chat isn't configured yet. Add GEMINI_API_KEY to server/.env and restart the server to enable it.",
      });
    }

    const persona = MODULE_PROMPTS[module] || MODULE_PROMPTS.dashboard;
    const systemPrompt = `${persona}

Keep replies short (2-5 sentences), specific, and actionable. Here is the user's current data for this module as JSON — use it, don't ask the user to repeat it:
${JSON.stringify(context)}`;

    // Gemini's "contents" format: prior turns use role "user"/"model".
    const contents = [
      ...history.slice(-10).map((h) => ({
        role: h.role === "assistant" || h.role === "model" ? "model" : "user",
        parts: [{ text: String(h.content || "") }],
      })),
      { role: "user", parts: [{ text: message }] },
    ];

    // Fail fast instead of hanging the frontend's "Thinking…" state forever
    // if Gemini's endpoint stalls.
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("TIMEOUT")), 25000)
    );

    let response;
    try {
      response = await Promise.race([
        ai.models.generateContent({
          model: MODEL,
          contents,
          config: {
            systemInstruction: systemPrompt,
            maxOutputTokens: 400,
          },
        }),
        timeoutPromise,
      ]);
    } catch (genErr) {
      if (genErr.message === "TIMEOUT") {
        console.error("Gemini API timed out after 25s");
        return res.status(504).json({ message: "The AI assistant timed out. Please try again." });
      }
      throw genErr;
    }

    const reply = (response.text || "").trim();
    res.json({ reply: reply || "I'm not sure how to respond to that — could you rephrase?" });
  } catch (err) {
    console.error("Chat error:", err);
    res.status(500).json({ message: "The AI assistant hit an error. Please try again in a moment." });
  }
});

export default router;
