
export async function fetchWordDetails(
  apiKey: string,
  text: string
): Promise<{ definition: string; examples: string[] }> {
  const prompt = `Provide a brief definition and 1-3 concise example sentences for the following English word or saying. Respond ONLY in JSON, with keys "definition" and "examples" (array of strings): ${text}`;

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 250,
      temperature: 0.7,
    }),
  });

  if (!res.ok) throw new Error('Failed to fetch from OpenAI');
  const data = await res.json();
  const content: string = data.choices[0].message.content;

  try {
    const parsed = JSON.parse(content);
    if (!parsed.definition || !parsed.examples) throw new Error();
    return { definition: parsed.definition, examples: parsed.examples };
  } catch {
    // fallback to raw string
    return { definition: content, examples: [] };
  }
}
