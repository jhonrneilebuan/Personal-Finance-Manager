export const aiCategorizationService = {
  async suggestCategory(input: string): Promise<string | null> {
    const normalized = input.toLowerCase();
    if (normalized.includes('jollibee')) return 'Food';
    if (normalized.includes('grab')) return 'Transportation';
    if (normalized.includes('meralco')) return 'Utilities';
    return null;
  },

  async explainSuggestion(_input: string, category: string) {
    return `Placeholder categorization matched this transaction to ${category}. AI integration is intentionally not enabled yet.`;
  },
};

