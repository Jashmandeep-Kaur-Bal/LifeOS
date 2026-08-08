import { GoogleGenAI } from "@google/genai";

// Same pattern as routes/chat.js: only construct a client if a key is
// actually configured, so this module is safe to import even when AI chat
// isn't set up.
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const MODEL = "gemini-3.5-flash-lite";
const ai = GEMINI_API_KEY ? new GoogleGenAI({ apiKey: GEMINI_API_KEY }) : null;

function fallbackOverview({ moduleLabel, ownerName, done, total, metrics, warnings }) {
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  const metricLine = metrics.length
    ? ` Key figures: ${metrics.map((m) => `${m.label}: ${m.value}`).join(", ")}.`
    : "";
  const warningLine =
    warnings.length === 0
      ? " No validation warnings were flagged."
      : ` ${warnings.length} validation warning${warnings.length === 1 ? "" : "s"} were flagged during review.`;
  return `This ${moduleLabel} agent task for ${ownerName} is ${done}/${total} complete (${pct}%).${metricLine}${warningLine}`;
}

function fallbackRecommendations({ warnings, missingFields }) {
  if (warnings.length === 0 && missingFields.length === 0) {
    return "No outstanding issues were found — this record looks ready for sign-off.";
  }
  const lines = [];
  missingFields.slice(0, 5).forEach((f) => lines.push(`Complete: ${f.label}.`));
  warnings.slice(0, 5).forEach((w) => lines.push(`Review: ${w}`));
  return lines.join(" ");
}

function buildFallback(ctx) {
  return {
    sections: [
      { id: "overview", heading: "Overview", body: fallbackOverview(ctx), source: "template" },
      { id: "recommendations", heading: "Recommendations", body: fallbackRecommendations(ctx), source: "template" },
    ],
  };
}

// Tries a single Gemini call for a natural-language overview + recommendation,
// but always returns two complete sections — if no API key is configured,
// the call errors, times out, or the response doesn't parse as the expected
// JSON shape, it silently falls back to deterministic text built from the
// same facts. This keeps the review packet usable with zero AI setup.
export async function generateNarrative(ctx) {
  const { moduleLabel, ownerName, done, total, metrics, warnings, missingFields } = ctx;
  const fallback = buildFallback(ctx);
  if (!ai) return fallback;

  const prompt = `You are helping write a short, factual review packet for a reviewer looking at a "${moduleLabel}" record belonging to ${ownerName}.
Checklist completion: ${done}/${total}.
Metrics: ${JSON.stringify(metrics)}
Validation warnings: ${JSON.stringify(warnings)}
Missing checklist items: ${JSON.stringify(missingFields.map((f) => f.label))}

Respond with ONLY a JSON object, no markdown fences, no commentary, in exactly this shape:
{"overview": "2-4 sentence factual overview of the record's current state", "recommendations": "2-4 sentence plain-language recommendation for the reviewer, referencing the warnings/missing items if any"}`;

  const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("TIMEOUT")), 20000));

  try {
    const response = await Promise.race([
      ai.models.generateContent({
        model: MODEL,
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        config: { maxOutputTokens: 400 },
      }),
      timeoutPromise,
    ]);

    const raw = (response.text || "")
      .trim()
      .replace(/^```(json)?/i, "")
      .replace(/```$/i, "")
      .trim();
    const parsed = JSON.parse(raw);
    if (!parsed.overview || !parsed.recommendations) throw new Error("Incomplete AI response");

    return {
      sections: [
        { id: "overview", heading: "Overview", body: String(parsed.overview), source: "ai" },
        { id: "recommendations", heading: "Recommendations", body: String(parsed.recommendations), source: "ai" },
      ],
    };
  } catch (err) {
    return fallback;
  }
}
