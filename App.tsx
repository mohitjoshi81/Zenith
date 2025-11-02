
import React, { useState, useCallback } from 'react';
import Header from './components/Header';
import SessionGenerator from './components/SessionGenerator';
import SessionPlayer from './components/SessionPlayer';
import Chatbot from './components/Chatbot';
import Loader from './components/Loader';
import { generateFullSession } from './services/geminiService';
import type { SessionOptions, SessionData } from './types';

const App: React.FC = () => {
  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateSession = useCallback(async (options: SessionOptions) => {
    setIsLoading(true);
    setError(null);
    setSessionData(null);
    try {
      const data = await generateFullSession(options);
      setSessionData(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {isLoading && <Loader message="Creating your personalized session..." />}
      <Header />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="space-y-12">
          <div className="text-center">
            <h1 className="text-3xl md:text-5xl font-extrabold text-slate-800 mb-2">Your Personal Wellness Sanctuary</h1>
            <p className="max-w-3xl mx-auto text-slate-500 text-lg">
              Craft a unique moment of calm and focus. Let our AI guide you through meditation, stretching, and breathing exercises tailored just for you.
            </p>
          </div>
          
          <SessionGenerator onGenerate={handleGenerateSession} isLoading={isLoading} />
          
          {error && (
            <div className="max-w-2xl mx-auto bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md" role="alert">
              <p className="font-bold">Generation Failed</p>
              <p>{error}</p>
            </div>
          )}

          {sessionData && <SessionPlayer sessionData={sessionData} />}
        </div>
      </main>
      <Chatbot />
    </div>
  );
};

export default App;
