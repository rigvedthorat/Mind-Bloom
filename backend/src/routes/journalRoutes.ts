// src/routes/journalRoutes.ts
import { Express } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../databaseSupport/prismaClient';
import { recommendQuote } from '../services/openaiQuoteService';

// Middleware to verify JWT token
const authenticateToken = (req: any, res: any, next: any) => {
	const authHeader = req.headers['authorization'];
	const token = authHeader && authHeader.split(' ')[1];

	if (!token) {
		return res.status(401).json({ error: 'Access denied. No token provided.' });
	}

	try {
		const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
		const decoded = jwt.verify(token, JWT_SECRET);
		req.user = decoded;
		next();
	} catch (error) {
		return res.status(403).json({ error: 'Invalid token.' });
	}
};

const randomItem = <T>(items: T[]): T | null =>
	items.length === 0 ? null : items[Math.floor(Math.random() * items.length)];

const formatEntry = (entry: any) => ({
	id: entry.id,
	user_id: entry.userId,
	content: entry.content,
	mood: entry.mood,
	affirmation_id: entry.affirmationId,
	quote_id: entry.quoteId,
	entry_date: entry.entryDate,
	created_at: entry.createdAt,
	updated_at: entry.updatedAt,
	affirmation_content: entry.quote?.content || entry.affirmation?.content || null,
	mood_type: entry.quote?.moodType || entry.affirmation?.moodType || null,
	relevance_score: entry.quote?.relevanceScore || null,
	context_summary: entry.quote?.contextSummary || null,
});

export const registerJournalRoutes = (app: Express) => {
	console.log('Registering journal routes'); // Debug log

	// Create a new journal entry
	app.post('/api/journal', authenticateToken, async (req: any, res: any) => {
		console.log('POST /api/journal received:', req.body); // Debug log

		try {
			const { content, mood } = req.body;
			const userId = req.user.userId;

			// Validate request
			if (!content || !mood) {
				return res.status(400).json({ error: 'Content and mood are required' });
			}

			const [moodAffirmations, fallbackAffirmations, quoteRecommendation] =
				await Promise.all([
					prisma.affirmation.findMany({ where: { moodType: mood } }),
					prisma.affirmation.findMany({ where: { moodType: 'Reflective' } }),
					recommendQuote(mood, content),
				]);

			const affirmation =
				randomItem(moodAffirmations) || randomItem(fallbackAffirmations);
			const quote = await prisma.inspirationalQuote.create({
				data: {
					content: quoteRecommendation.content,
					moodType: quoteRecommendation.moodType,
					relevanceScore: quoteRecommendation.relevanceScore,
					contextSummary: quoteRecommendation.contextSummary,
					source: quoteRecommendation.source,
					model: quoteRecommendation.model,
				},
			});

			// Insert journal entry
			const entry = await prisma.journalEntry.create({
				data: {
					userId,
					content,
					mood,
					affirmationId: affirmation?.id || null,
					quoteId: quote.id,
				},
				include: {
					affirmation: true,
					quote: true,
				},
			});

			// Return the entry with the affirmation
			res.status(201).json({
				message: 'Journal entry created successfully',
				entry: formatEntry(entry),
				affirmation: quote.content,
				quote: {
					content: quote.content,
					mood_type: quote.moodType,
					relevance_score: quote.relevanceScore,
					context_summary: quote.contextSummary,
					source: quote.source,
					model: quote.model,
				},
			});
		} catch (error) {
			console.error('Journal entry creation error:', error);
			res.status(500).json({ error: 'Internal server error' });
		}
	});

	// Get all journal entries for the logged-in user
	app.get('/api/journal', authenticateToken, async (req: any, res: any) => {
		console.log('GET /api/journal received'); // Debug log

		try {
			const userId = req.user.userId;

			// Get all entries for the user with affirmations
			const entries = await prisma.journalEntry.findMany({
				where: { userId },
				include: { affirmation: true, quote: true },
				orderBy: [{ entryDate: 'desc' }, { createdAt: 'desc' }],
			});

			console.log(`Retrieved ${entries.length} entries for user ${userId}`); // Debug log
			res.status(200).json(entries.map(formatEntry));
		} catch (error) {
			console.error('Journal entries fetch error:', error);
			res.status(500).json({ error: 'Internal server error' });
		}
	});

	// Get a specific journal entry by ID
	app.get('/api/journal/:id', authenticateToken, async (req: any, res: any) => {
		console.log(`GET /api/journal/${req.params.id} received`); // Debug log

		try {
			const userId = req.user.userId;
			const entryId = req.params.id;

			// Get the entry with affirmation
			const entry = await prisma.journalEntry.findFirst({
				where: { id: Number(entryId), userId },
				include: { affirmation: true, quote: true },
			});

			if (!entry) {
				return res.status(404).json({ error: 'Journal entry not found' });
			}

			res.status(200).json(formatEntry(entry));
		} catch (error) {
			console.error('Journal entry fetch error:', error);
			res.status(500).json({ error: 'Internal server error' });
		}
	});

	// Get entries by date
	app.get(
		'/api/journal/date/:date',
		authenticateToken,
		async (req: any, res: any) => {
			console.log(`GET /api/journal/date/${req.params.date} received`); // Debug log

			try {
				const userId = req.user.userId;
				const entryDate = req.params.date; // Format: YYYY-MM-DD

				// Get entries for the specified date
				const entries = await prisma.journalEntry.findMany({
					where: {
						userId,
						entryDate: new Date(`${entryDate}T00:00:00.000Z`),
					},
					include: { affirmation: true, quote: true },
					orderBy: { createdAt: 'desc' },
				});

				console.log(
					`Retrieved ${entries.length} entries for date ${entryDate}`
				); // Debug log
				res.status(200).json(entries.map(formatEntry));
			} catch (error) {
				console.error('Journal entries by date fetch error:', error);
				res.status(500).json({ error: 'Internal server error' });
			}
		}
	);
};
