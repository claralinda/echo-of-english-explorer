
export async function fetchWordDetails(
  apiKey: string,
  text: string
): Promise<{ definition: string; examples: string[] }> {
  // MOCK IMPLEMENTATION: returns fake data for any text input
  await new Promise((res) => setTimeout(res, 400)); // Simulate network delay
  return {
    definition: `This is a mock definition for "${text}".`,
    examples: [
      `Example usage 1 of "${text}".`,
      `Example usage 2 of "${text}".`
    ]
  };
}
