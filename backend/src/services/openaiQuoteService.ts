import OpenAI from 'openai';

export type QuoteRecommendation = {
	content: string;
	moodType: string;
	relevanceScore: number;
	contextSummary: string;
	model: string;
	source: 'openai' | 'fallback';
};

const fallbackQuote = (
	mood: string,
	journalContent: string,
	model = 'fallback'
): QuoteRecommendation => ({
	content: 'You are meeting this moment with courage, and each honest reflection is a step toward clarity.',
	moodType: mood,
	relevanceScore: 70,
	contextSummary: journalContent.trim().slice(0, 220),
	model,
	source: 'fallback',
});

const parseRecommendation = (
	rawText: string,
	mood: string,
	journalContent: string,
	model: string
): QuoteRecommendation => {
	const parsed = JSON.parse(rawText) as Partial<QuoteRecommendation>;
	const score = Number(parsed.relevanceScore);

	if (!parsed.content || !parsed.moodType || Number.isNaN(score)) {
		throw new Error('OpenAI response did not include the required quote fields');
	}

	return {
		content: parsed.content,
		moodType: parsed.moodType,
		relevanceScore: Math.max(0, Math.min(100, Math.round(score))),
		contextSummary:
			parsed.contextSummary || journalContent.trim().slice(0, 220),
		model,
		source: 'openai',
	};
};

export const recommendQuote = async (
	mood: string,
	journalContent: string
): Promise<QuoteRecommendation> => {
	const apiKey = process.env.OPENAI_API_KEY;
	const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';

	if (!apiKey) {
		return fallbackQuote(mood, journalContent);
	}

	const client = new OpenAI({ apiKey });

	try {
		const response = await client.responses.create({
			model,
			input: [
				{
					role: 'system',
					content:
						'You recommend short supportive inspirational quotes for a journaling app. Do not provide medical, diagnostic, or crisis advice. Return only valid JSON that matches the requested schema.',
				},
				{
					role: 'user',
					content: `Mood: ${mood}\nJournal entry:\n${journalContent}\n\nGenerate or select one concise inspirational quote that fits both the mood and journal context. Score relevance from 0 to 100.`,
				},
			],
			text: {
				format: {
					type: 'json_schema',
					name: 'journal_quote_recommendation',
					strict: true,
					schema: {
						type: 'object',
						additionalProperties: false,
						properties: {
							content: { type: 'string' },
							moodType: { type: 'string' },
							relevanceScore: { type: 'integer' },
							contextSummary: { type: 'string' },
						},
						required: [
							'content',
							'moodType',
							'relevanceScore',
							'contextSummary',
						],
					},
				},
			},
		});

		return parseRecommendation(response.output_text, mood, journalContent, model);
	} catch (error) {
		console.error('OpenAI quote recommendation failed:', error);
		return fallbackQuote(mood, journalContent, model);
	}
};
