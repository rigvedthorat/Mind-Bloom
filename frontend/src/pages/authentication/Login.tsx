import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { authAPI } from '../../api';
import './auth.css';

import { motion } from 'framer-motion';
const Login = () => {
	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');
	// const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);
	// const [success, setSuccess] = useState(false);

	const validateForm = () => {
		// Basic validation
		if (!username.trim()) {
			// setError('Username is required');
			toast.error('Username is required', {
				position: 'top-right',
				autoClose: 5000,
				hideProgressBar: false,
				closeOnClick: true,
				pauseOnHover: true,
				draggable: true,
				progress: undefined,
			});
			return false;
		}

		if (!password.trim()) {
			// setError('Password is required');
			toast.error('Password is required', {
				position: 'top-right',
				autoClose: 5000,
				hideProgressBar: false,
				closeOnClick: true,
				pauseOnHover: true,
				draggable: true,
				progress: undefined,
			});
			return false;
		}

		return true;
	};

	const handleSubmit = async () => {
		// Reset states
		// setError(null);
		// setSuccess(false);

		// Validate the form
		if (!validateForm()) {
			return;
		}

		setLoading(true);

		try {
			// Call the login API
			await authAPI.login(username, password);
			// setSuccess(true);

			// Redirect to home after successful login
			toast.success('Login successful!', {
				position: 'top-center',
				autoClose: 2000,
				hideProgressBar: false,
				closeOnClick: true,
				pauseOnHover: true,
				draggable: true,
				progress: undefined,
			});
			setTimeout(() => {
				window.location.href = '/home';
			}, 2000);
		} catch (err) {
			// setError(
			// 	err instanceof Error
			// 		? err.message
			// 		: 'Login failed. Please check your credentials and try again.'
			// );
			toast.error(
				err instanceof Error
					? err.message
					: 'Login failed. Please check your credentials and try again.',
				{
					position: 'top-right',
					autoClose: 5000,
					hideProgressBar: false,
					closeOnClick: true,
					pauseOnHover: true,
					draggable: true,
					progress: undefined,
				}
			);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div>
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
			</div>
			<div
				className="flex flex-col items-center justify-center min-h-screen py-2 h-1.5 "
				style={{ marginTop: '-6rem' }}
			>
				<ToastContainer />
				<h1 className="text-2xl font-bold">Login</h1>

				{/* {error && <div className="text-red-500 mt-4">{error}</div>} */}

				<div className="flex flex-col justify-between mb-4 m-10 gap-1">
					<div className="flex items-center gap-7 justify-between mt-2">
						<label
							htmlFor="username"
							className="block text-sm font-medium text-gray-700"
						>
							Username
						</label>
						<input
							type="text"
							id="username"
							name="username"
							className="form-input"
							value={username}
							onChange={(e) => setUsername(e.target.value)}
							disabled={loading}
						/>
					</div>
					<div className="flex items-center gap-7 justify-between mt-2">
						<label
							htmlFor="password"
							className="block text-sm font-medium text-gray-700"
						>
							Password
						</label>
						<input
							type="password"
							id="password"
							name="password"
							className="form-input"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							disabled={loading}
						/>
					</div>

					<br />
					<div className="flex items-center gap-7 justify-center mt-2">
						<div
							onClick={() => {
								if (!loading) {
									window.location.href = '/auth/register';
								}
							}}
						>
							<Button variant="outline" className="ml-2" disabled={loading}>
								Register
							</Button>
						</div>
						<div
							onClick={() => {
								if (!loading) {
									handleSubmit();
								}
							}}
						>
							<Button disabled={loading}>
								{loading ? 'Logging in...' : 'Login'}
							</Button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Login;
// Note: The above code is a simplified version of the login page. In a real-world application, you would also want to handle token storage, user session management, and possibly use a state management library like Redux or Context API for better state handling across your application.
