import { Button } from '@/components/ui/button';
import { useMood } from '@/context/MoodContext';
import { useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { journalAPI } from '../api';

interface QuoteRecommendation {
	content: string;
	mood_type: string;
}

export default function JournalEntry() {
	const { selectedMood } = useMood();
	const [journalEntry, setJournalEntry] = useState<string>('');
	const [loading, setLoading] = useState<boolean>(false);
	const [quote, setQuote] = useState<QuoteRecommendation | null>(null);
	const [showQuote, setShowQuote] = useState<boolean>(false);

	const saveEntry = async () => {
		if (!journalEntry.trim()) {
			toast.error('Please write a journal entry before saving.', {
				position: 'top-right',
			});
			return;
		}

		if (!selectedMood) {
			toast.error('Please select your mood before saving your journal entry.', {
				position: 'top-right',
			});
			return;
		}

		setLoading(true);

		try {
			console.log('Saving journal entry:', {
				content: journalEntry,
				mood: selectedMood,
			});

			const data = await journalAPI.createEntry(journalEntry, selectedMood);
			console.log('Success response:', data);

			const quoteContent = data.quote?.content || data.affirmation;

			if (quoteContent) {
				setQuote({
					content: quoteContent,
					mood_type: data.quote?.mood_type || selectedMood,
				});
				setShowQuote(true);
			}

			setJournalEntry(''); // Clear the entry after saving
			toast.success('Journal entry saved successfully!', {
				position: 'top-right',
			});
		} catch (error) {
			console.error('Error saving journal entry:', error);
			toast.error(
				error instanceof Error ? error.message : 'Failed to save journal entry',
				{
					position: 'top-right',
				}
			);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div>
			<div className="flex flex-col justify-center items-center mb-4">
				{showQuote && quote && (
					<div className="mt-6 p-4 border rounded-lg max-w-lg text-center bg-primary/10">
						<h3 className="text-xl font-semibold mb-2">
							Your Inspirational Quote
						</h3>
						<p className="text-lg italic">{quote.content}</p>
						<Button
							variant="outline"
							className="mt-4"
							onClick={() => setShowQuote(false)}
						>
							Close
						</Button>
					</div>
				)}
			</div>
			<h2 className="text-2xl font-bold mb-4">Journal Entry</h2>
			<ToastContainer />
			<div className="flex flex-col justify-center items-center gap-4">
				{selectedMood && (
					<p className="text-lg font-semibold">
						Mood: <span className="text-blue-600">{selectedMood}</span>
					</p>
				)}

				<textarea
					className="border rounded-md p-2 w-full"
					rows={5}
					placeholder="Write your journal entry here..."
					style={{
						resize: 'none',
						width: '100%',
						maxWidth: '1000px',
					}}
					value={journalEntry}
					onChange={(e) => setJournalEntry(e.target.value)}
					disabled={loading}
				/>

				<Button className="flex w-56" onClick={saveEntry} disabled={loading}>
					{loading ? 'Saving...' : 'Save Entry'}
				</Button>
			</div>
		</div>
	);
}
