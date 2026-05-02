import groq from "../config/groq.js";

export const classifyAndSuggest = async (ticketContent, orgContext) => {
  try {
    const prompt = `
You are a customer support AI assistant for the following business context:
"${orgContext}"

Analyze the following customer ticket and respond ONLY with a valid JSON object (no markdown, no extra text).
The JSON object must have exactly these keys:
- "category": (string) one of "billing", "technical", "general", "other"
- "priority": (string) one of "low", "medium", "high", "urgent"
- "suggestedReply": (string) a professional, helpful draft reply to the customer
- "confidence": (number) between 0 and 100 indicating how confident you are in your suggested reply

Important: Never confirm, promise, or process any actions like refunds, replacements, or resolutions in your reply. Only acknowledge the issue empathetically and inform the customer that a human agent will review and follow up shortly.

Customer Ticket:
"${ticketContent}"
`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are a specialized JSON-only support API. Always return raw JSON.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      model: "llama-3.3-70b-versatile",  /*llama-3.1-8b-instant*/
      temperature: 0.3,
      response_format: { type: "json_object" },
    });

    const responseContent = chatCompletion.choices[0]?.message?.content;
    return JSON.parse(responseContent);
  } catch (error) {
    console.error("AI Service Error:", error);
    return {
      category: "general",
      priority: "medium",
      suggestedReply: "Thank you for reaching out. An agent will review your request shortly.",
      confidence: 0,
    };
  }
};

export const handleFollowUp = async (customerMessage, orgContext) => {
  try {
    const prompt = `
You are a customer support AI assistant for the following business context:
"${orgContext}"

The customer is asking a follow-up question in an existing support ticket.

Determine if this is a simple FAQ question you can answer directly (like navigation help, how-to questions, finding a page, basic account questions).

Respond ONLY with a valid JSON object:
- "canAnswer": (boolean) true if you can answer directly, false if it needs a human agent
- "reply": (string) if canAnswer is true, give a helpful direct answer. If false, say "We've received your message and have assigned a support agent to your case. They will follow up with you shortly."

Important: Never confirm actions like refunds, replacements, or order changes — those always go to human agents (canAnswer: false).

Customer message: "${customerMessage}"
`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: "You are a specialized JSON-only support API. Always return raw JSON." },
        { role: "user", content: prompt },
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.3,
      response_format: { type: "json_object" },
    });

    return JSON.parse(chatCompletion.choices[0]?.message?.content);
  } catch (error) {
    return { canAnswer: false, reply: "We've received your message and have assigned a support agent to your case. They will follow up with you shortly." };
  }
};

export const tuneTone = async (text, tone) => {
  try {
    const prompt = `Rewrite the following text to sound more ${tone}. 
Keep the core meaning exactly the same, but adjust the vocabulary and sentence structure to fit the requested tone.
Respond ONLY with the rewritten text, without any quotes or explanations.

Text to rewrite:
"${text}"`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile",
      temperature: 0.5,
    });

    return chatCompletion.choices[0]?.message?.content?.trim() || text;
  } catch (error) {
    console.error("AI Tone Tuning Error:", error);
    return text;
  }
};

export const translateText = async (text, targetLanguage) => {
  try {
    const prompt = `Translate the following text into ${targetLanguage}.
Respond ONLY with the translated text, without any quotes or explanations.

Text to translate:
"${text}"`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile",
      temperature: 0.2,
    });

    return chatCompletion.choices[0]?.message?.content?.trim() || text;
  } catch (error) {
    console.error("AI Translation Error:", error);
    return text;
  }
};

export const draftFromLiveText = async (liveText, orgContext) => {
  try {
    const prompt = `
You are a customer support agent for: "${orgContext}".
A customer is currently typing a message, but hasn't sent it yet. The text might be incomplete.

Customer is typing:
"${liveText}"

Based on this partial text, anticipate their question or issue, and draft a helpful, professional response.
Respond ONLY with the draft text, no quotes, no explanations. Do not promise refunds or confirm actions.`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile",
      temperature: 0.4,
    });

    return chatCompletion.choices[0]?.message?.content?.trim() || "I see you are typing. I'm here to help!";
  } catch (error) {
    console.error("AI Live Draft Error:", error);
    return "Looking into this for you...";
  }
};