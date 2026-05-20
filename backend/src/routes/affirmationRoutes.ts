// src/routes/affirmationRoutes.ts
import { Express } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../databaseSupport/prismaClient';

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

export const registerAffirmationRoutes = (app: Express) => {
	// Get today's affirmation for a specific mood
	app.get(
		'/api/affirmation/today',
		authenticateToken,
		async (req: any, res: any) => {
			try {
				// Get mood from query params, default to Reflective
				const mood = req.query.mood || 'Reflective';

				// Get a random affirmation based on mood
				const affirmations = await prisma.affirmation.findMany({
					where: { moodType: String(mood) },
				});
				const affirmation = randomItem(affirmations);

				if (!affirmation) {
					// If no affirmation for specific mood, try to get a fallback
					const fallbackAffirmations = await prisma.affirmation.findMany({
						where: { moodType: 'Reflective' },
					});
					const fallbackAffirmation = randomItem(fallbackAffirmations);

					if (!fallbackAffirmation) {
						return res.status(404).json({ error: 'No affirmations found' });
					}

					return res.status(200).json({
						id: fallbackAffirmation.id,
						content: fallbackAffirmation.content,
						mood_type: fallbackAffirmation.moodType,
						created_at: fallbackAffirmation.createdAt,
						updated_at: fallbackAffirmation.updatedAt,
					});
				}

				res.status(200).json({
					id: affirmation.id,
					content: affirmation.content,
					mood_type: affirmation.moodType,
					created_at: affirmation.createdAt,
					updated_at: affirmation.updatedAt,
				});
			} catch (error) {
				console.error('Affirmation fetch error:', error);
				res.status(500).json({ error: 'Internal server error' });
			}
		}
	);

	// Get all affirmations for a specific mood
	app.get(
		'/api/affirmations/:mood',
		authenticateToken,
		async (req: any, res: any) => {
			try {
				const mood = req.params.mood;

				// Get all affirmations for the mood
				const affirmations = await prisma.affirmation.findMany({
					where: { moodType: mood },
				});

				if (affirmations.length === 0) {
					return res
						.status(404)
						.json({ error: 'No affirmations found for the specified mood' });
				}

				res.status(200).json(
					affirmations.map((affirmation) => ({
						id: affirmation.id,
						content: affirmation.content,
						mood_type: affirmation.moodType,
						created_at: affirmation.createdAt,
						updated_at: affirmation.updatedAt,
					}))
				);
			} catch (error) {
				console.error('Affirmations fetch error:', error);
				res.status(500).json({ error: 'Internal server error' });
			}
		}
	);
};
