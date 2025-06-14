
export async function fetchWordDetails({
  apiKey,
  text,
  signal
}: {
  apiKey: string,
  text: string,
  signal?: AbortSignal
}): Promise<{ definition: string; examples: string[] }> {
  // OpenAI Chat API endpoint
  const endpoint = "https://api.openai.com/v1/chat/completions";
  const prompt = `Write a concise (max 40 words) English definition for "${text}", but do NOT start with phrases like "${text} means" or "The word ${text} means". Just provide the direct definition. Then give 2 example sentences using "${text}" in context. Format your reply as:
Definition: ...
Examples:
1. ...
2. ...`;

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "You are an expert English language teacher." },
        { role: "user", content: prompt }
      ],
      temperature: 0.3,
      max_tokens: 250,
    }),
    signal,
  });

  if (!response.ok) {
    throw new Error(`OpenAI error: ${await response.text()}`);
  }

  const data = await response.json();
  const content: string = data.choices?.[0]?.message?.content || "";

  // Parse reply for Definition and numbered examples
  let definition = "";
  const examples: string[] = [];

  const defMatch = content.match(/Definition:(.*?)(?:\n|$)/i);
  if (defMatch) definition = defMatch[1].trim();

  const exMatches = content.match(/Examples:\s*((?:\d+\.\s.*\n?)+)/i);
  if (exMatches) {
    exMatches[1]
      .split("\n")
      .forEach(line => {
        const m = line.match(/^\d+\.\s*(.*)/);
        if (m && m[1]) examples.push(m[1].trim());
      });
  }
  // fallback: if didn't parse but content isn't empty
  if (!definition && content) {
    definition = content.split("\n")[0].trim();
  }
  if (examples.length === 0 && content.includes("\n")) {
    // Try to grab any lines after first
    const lines = content.split("\n");
    if (lines.length > 1) examples.push(...lines.slice(1).map(l => l.trim()).filter(Boolean));
  }
  return {
    definition,
    examples
  };
}
