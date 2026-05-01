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
