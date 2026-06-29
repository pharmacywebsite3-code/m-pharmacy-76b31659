import { createServerFn } from "@tanstack/react-start";

export type ChatMessage = { role: "user" | "assistant" | "system"; content: string };

const SYSTEM_PROMPT = `You are the M-Pharmacy AI Pharmacist Assistant — a warm, careful, knowledgeable virtual pharmacist.

Your job:
- Answer questions about medications (uses, typical dosage guidance, common side effects, interactions), OTC product recommendations, prescription refill questions, and M-Pharmacy services (prescription upload, delivery, refills).
- Keep replies concise (2–5 short sentences) and clear.
- For any dosing, drug interaction, or symptom-specific question, add a brief safety note recommending the user confirm with a licensed pharmacist or their doctor.
- Never invent prices, stock, or order details.

LANGUAGE RULE (critical):
- If the user's message is written in Amharic (Ge'ez / ፊደል script), reply ENTIRELY in fluent Amharic.
- If the user's message is in English, reply in English.
- If mixed, match the dominant language. Do not translate unless asked.`;

function detectAmharic(text: string): boolean {
  // Ethiopic Unicode block U+1200–U+137F
  return /[\u1200-\u137F]/.test(text);
}

export const askPharmacist = createServerFn({ method: "POST" })
  .inputValidator((input: { messages: ChatMessage[] }) => {
    if (!input || !Array.isArray(input.messages)) throw new Error("messages required");
    return input;
  })
  .handler(async ({ data }): Promise<{ reply: string; lang: "am" | "en" }> => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("Missing LOVABLE_API_KEY");

    const last = data.messages[data.messages.length - 1]?.content ?? "";
    const lang: "am" | "en" = detectAmharic(last) ? "am" : "en";

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...data.messages.slice(-10),
        ],
      }),
    });

    if (!res.ok) {
      const txt = await res.text().catch(() => "");
      if (res.status === 429) throw new Error("Rate limit reached. Please try again in a moment.");
      if (res.status === 402) throw new Error("AI credits exhausted. Please add credits to continue.");
      throw new Error(`AI request failed (${res.status}): ${txt.slice(0, 200)}`);
    }

    const json = await res.json();
    const reply = json?.choices?.[0]?.message?.content?.trim() ?? "";
    return { reply, lang };
  });
