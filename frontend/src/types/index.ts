export interface User {
	id: number;
	username: string;
	email: string;
}

export interface AuthState {
	isAuthenticated: boolean;
	user: User | null;
	token: string | null;
	loading: boolean;
	error: string | null;
}

export interface JournalEntry {
	id: number;
	user_id: number;
	content: string;
	mood: string;
	affirmation_id: number | null;
	quote_id: number | null;
	quote_content: string | null;
	relevance_score: number | null;
	context_summary: string | null;
	entry_date: string;
	created_at: string;
	updated_at: string;
}

export interface Affirmation {
	id: number;
	content: string;
	mood_type: 'happy' | 'neutral' | 'sad';
	created_at: string;
	updated_at: string;
}
