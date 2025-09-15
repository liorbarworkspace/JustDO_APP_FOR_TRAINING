import React, { useState } from 'react';
import { LockIcon } from './icons';

interface LoginProps {
    onLogin: (key: string) => boolean;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
    const [key, setKey] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        // Simulate a small delay for better UX
        setTimeout(() => {
            const success = onLogin(key);
            if (!success) {
                setError('מפתח גישה שגוי. אנא נסה שנית.');
                setKey(''); // Clear the input on failure
            }
            setIsLoading(false);
        }, 300);
    };

    return (
        <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center p-4 overflow-x-hidden">
            <div className="w-full max-w-sm mx-auto text-center">
                <div className="mx-auto mb-6 w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center border-2 border-amber-500">
                    <LockIcon className="w-8 h-8 text-amber-400" />
                </div>
                <h1 className="text-3xl font-bold text-white mb-2">תוכנית אימונים אישית</h1>
                <p className="text-gray-400 mb-8">אנא הזן מפתח גישה כדי להמשיך</p>
                
                <div className="bg-slate-800 rounded-lg shadow-2xl p-6 md:p-8 border border-slate-700">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="access-key" className="sr-only">מפתח גישה</label>
                            <input
                                type="password"
                                id="access-key"
                                value={key}
                                onChange={(e) => setKey(e.target.value)}
                                placeholder="הזן מפתח גישה"
                                required
                                className="w-full text-center bg-slate-700 border border-slate-600 text-white text-lg rounded-lg focus:ring-amber-500 focus:border-amber-500 block p-3"
                                autoFocus
                            />
                        </div>
                        
                        {error && <p className="text-red-400 text-sm">{error}</p>}

                        <div>
                            <button
                                type="submit"
                                disabled={isLoading || !key}
                                className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 px-4 rounded-lg transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-opacity-75 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? 'מאמת...' : 'כניסה'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;
