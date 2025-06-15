
export async function fetchWordDetails({
  apiKey,
  text,
  signal
}: {
  apiKey: string,
  text: string,
  signal?: AbortSignal
}): Promise<{ definition: string; examples: { answer: string, sentence: string }[] }> {
  // OpenAI Chat API endpoint
  const endpoint = "https://api.openai.com/v1/chat/completions";
  const prompt = `
Write a concise English definition for "${text}" in no more than 150 characters. Do NOT start with phrases like "${text} means" or "The word ${text} means". Just provide the direct definition.

Then, provide 2 example sentences using "${text}" in context. For each example, identify and extract the exact substring from the sentence that shows the form, conjugation, or inflected version of "${text}" as it appears in the sentence (e.g. pronouns changed, tense changed, etc).

Format your reply as valid JSON using this schema:
{
  "definition": "A direct short definition here.",
  "examples": [
    { "sentence": "Sentence with the saying here.", "answer": "exact substring of saying as used" },
    { "sentence": "Another sentence here.", "answer": "exact substring of saying as used" }
  ]
}

Only reply with valid JSON. Do not include any other commentary or formatting. Ensure answer is the exact substring as it appears in the sentence.
`.trim();

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
      max_tokens: 350,
    }),
    signal,
  });

  if (!response.ok) {
    throw new Error(`OpenAI error: ${await response.text()}`);
  }

  const data = await response.json();
  const content: string = data.choices?.[0]?.message?.content || "";

  // Attempt to parse as JSON. If fails, fallback to previous logic.
  let parsed: null | { definition: string, examples: { sentence: string; answer: string }[] } = null;
  try {
    // To tolerate weird code block markup: remove ```json blocks if present
    const cleaned = content.replace(/```json|```/g, '').trim();
    parsed = JSON.parse(cleaned);
  } catch {}

  if (parsed && typeof parsed.definition === "string" && Array.isArray(parsed.examples)) {
    // Ensure answer is always present and valid
    const examples = parsed.examples.map((ex) => ({
      sentence: ex.sentence,
      answer: ex.answer || "",
    })).filter(ex => !!ex.sentence && !!ex.answer);

    return {
      definition: parsed.definition,
      examples,
    };
  }
  
  // Fallback: legacy parsing logic
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
  
  // Transform to required format: { answer, sentence }
  // fallback: automatic extraction if the new prompt fails
  const structuredExamples = examples.map(sentence => ({
    sentence,
    answer: extractExampleAnswer(sentence, text),
  }));

  return {
    definition,
    examples: structuredExamples
  };
}

// Try to extract the saying/conjugation used in the example.
// For now, naively find the first substring matching the prompt word (case-insensitive).
function extractExampleAnswer(sentence: string, phrase: string): string {
  const targetWords = phrase.split(/\s+/).filter(Boolean);
  if (targetWords.length < 2) {
    // fallback: una singola parola, cerca match case-insensitive
    const re = new RegExp(targetWords[0].replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), "i");
    const match = sentence.match(re);
    return match ? match[0] : phrase;
  }
  // Prova a trovare da più parole a meno (almeno 2 parole consecutive)
  for (let len = targetWords.length; len >= 2; len--) {
    for (let start = 0; start <= targetWords.length - len; start++) {
      const candidate = targetWords.slice(start, start + len).join(" ");
      const re = new RegExp(candidate.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), "i");
      const match = sentence.match(re);
      if (match) return match[0];
    }
  }
  // Prova la frase intera
  const phraseRe = new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), "i");
  const phraseMatch = sentence.match(phraseRe);
  if (phraseMatch) return phraseMatch[0];
  // fallback
  return phrase;
}

