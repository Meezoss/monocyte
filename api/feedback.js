// /api/feedback.js
export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const { answers } = req.body || {};
    if (!Array.isArray(answers)) {
      return res.status(400).json({ error: "Invalid payload" });
    }

    // Build prompt
    const summaryPrompt = answers
      .map(({ q, a }, i) => `${i + 1}. ${q} → ${a}`)
      .join("\n");

    // Debug
    console.log("📨 Summary Prompt:", summaryPrompt);

    const body = {
      model: "command-r-plus",
      message:
        "You are a concise triage assistant. Summarize the following questionnaire answers and " +
        "suggest 2–4 actionable next steps (no diagnosis):\n" +
        summaryPrompt,
      temperature: 0.2,
    };

    console.log("📨 Cohere Request Body:", JSON.stringify(body, null, 2));

    const r = await fetch("https://api.cohere.ai/v1/chat", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.COHERE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!r.ok) {
      const msg = await r.text();
      return res.status(500).json({ error: "Cohere error", details: msg });
    }

    const data = await r.json();
    // Cohere chat returns the text at data.text
    const summary =
      data.text ??
      data.message?.content?.map((c) => c.text).join("\n") ??
      "No summary returned.";

    return res.status(200).json({ summary });
  } catch (e) {
    return res.status(500).json({ error: "Server error", details: e.message });
  }
}
