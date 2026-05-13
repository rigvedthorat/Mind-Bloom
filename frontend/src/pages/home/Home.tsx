// home.tsx
import { Button } from '@/components/ui/button';
import { MoodProvider } from '@/context/MoodContext';
import JournalCalendar from '@/sections/JournalCalendar';
import JournalEntry from '@/sections/JournalEntry';
import Moods from '@/sections/Moods';
import { motion } from 'framer-motion';
import { Calendar } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { authAPI } from '../../api';
import './home.css';

// Define a simple User type
type User = {
	id: number;
	username: string;
	email: string;
};

const Home = () => {
	const [user, setUser] = useState<User | null>(null);
	const darkMode = false;

	useEffect(() => {
		const token = localStorage.getItem('token');
		if (!token) {
			window.location.href = '/auth/login';
			return;
		}

		try {
			const parseJwt = (token: string) => {
				const base64Url = token.split('.')[1];
				const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
				const jsonPayload = decodeURIComponent(
					atob(base64)
						.split('')
						.map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
						.join('')
				);
				return JSON.parse(jsonPayload);
			};

			const decoded = parseJwt(token);
			setUser({
				id: decoded.userId,
				username: decoded.username,
				email: decoded.email,
			});
		} catch (error) {
			console.error('Error parsing token:', error);
			handleLogout();
		}
	}, []);

	const handleLogout = () => {
		authAPI.logout();
		window.location.href = '/auth/login';
	};

	if (!user) {
		return <div className="loading">Loading...</div>;
	}

	return (
		<div className={`whole ${darkMode ? 'dark' : ''}`}>
			<div className="nav-bar">
				<motion.h1
					className="text-4xl font-bold text-gradient  "
					initial={{ opacity: 0, y: -20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.8, ease: 'easeOut' }}
					style={{
						textShadow: '0px 4px 6px rgba(0, 0, 0, 0.3)',
					}}
				>
					Welcome to Mind-Bloom
				</motion.h1>
				<div className="flex items-center gap-4">
					<Link to="/calendar">
						<Button variant="outline" className="flex items-center gap-2">
							<Calendar size={18} color="black" />
							<span style={{ color: 'black' }}>Calendar View</span>
						</Button>
					</Link>
					{/* <Button variant="ghost" onClick={() => setDarkMode(!darkMode)}>
						{darkMode ? <Sun size={20} /> : <Moon size={20} />}
					</Button> */}
				</div>
			</div>
			<div className="screen">
				<motion.div
					className="left-user"
					initial={{ opacity: 0, x: -20 }}
					animate={{ opacity: 1, x: 0 }}
					transition={{ duration: 0.5 }}
				>
					<div className="user-info">
						<h2>
							Hi, <strong>{user.username}</strong>! How are you today?
						</h2>
						<p>
							<strong>Email:</strong> {user.email}
						</p>
					</div>

					<div className="affirmations-calendar">
						<JournalCalendar />
					</div>

					<div className="logout">
						<Button onClick={handleLogout} variant="destructive">
							Logout
						</Button>
					</div>
				</motion.div>
				<motion.div
					className="right-app"
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5 }}
				>
					<MoodProvider>
						<div className="mood">
							<h2>How are you feeling today?</h2>
							<Moods />
						</div>
						<div className="journals">
							<JournalEntry />
						</div>
					</MoodProvider>
				</motion.div>
			</div>
		</div>
	);
};

export default Home;
