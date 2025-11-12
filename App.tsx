import React, { useState } from 'react';
import { View } from './types';
import Header from './components/Header';
import PublicFigureAnalysis from './components/PublicFigureAnalysis';
import UserAssessment from './components/UserAssessment';

const App: React.FC = () => {
  const [view, setView] = useState<View>('publicFigure');
  const [userProfile, setUserProfile] = useState<string | null>(null);
  const [isAboutOpen, setIsAboutOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans">
      <Header />
      <main className="container mx-auto p-4 md:p-8">
        <div className="max-w-4xl mx-auto mb-8">
          <div className="border border-gray-700 rounded-lg bg-gray-800/50">
            <button
              onClick={() => setIsAboutOpen(!isAboutOpen)}
              className="w-full flex justify-between items-center p-4 text-left font-semibold text-white focus:outline-none"
            >
              <span>About This App</span>
              <span className={`transform transition-transform duration-300 ${isAboutOpen ? 'rotate-180' : ''}`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </span>
            </button>
            {isAboutOpen && (
              <div className="p-4 border-t border-gray-700 text-gray-300 animate-fade-in space-y-3">
                <p>This application provides an AI-driven framework for evaluating the authenticity and internal coherence of public figures. It uses a descriptive, non-judgmental approach focused on providing insight rather than a verdict.</p>
                <p><strong>Why is this useful?</strong> In an era of curated public profiles and constant information overload, it's challenging to form a clear picture of public figures. This tool offers a structured method to cut through the noise, focusing on deeper patterns of coherence and authenticity rather than just surface-level narratives. It's designed to be a useful addition to your personal toolkit for critical thinking, helping you develop a more nuanced understanding of the people who shape our world.</p>
                <p>The "My Assessment" feature allows you to explore your own perspectives. If you complete it, the public figure analysis will include an additional layer of feedback, highlighting how your personal leanings might influence your perception.</p>
                <p><strong>Privacy:</strong> Your personal assessment can be encrypted and saved locally in your browser with a passphrase. No data is ever sent to a server.</p>
              </div>
            )}
          </div>
        </div>
        
        <nav className="flex justify-center mb-8 border-b border-gray-700">
          <button
            onClick={() => setView('publicFigure')}
            className={`px-6 py-3 text-lg font-medium transition-colors duration-300 ${
              view === 'publicFigure'
                ? 'text-cyan-400 border-b-2 border-cyan-400'
                : 'text-gray-400 hover:text-cyan-300'
            }`}
          >
            Public Figure Analysis
          </button>
          <button
            onClick={() => setView('userAssessment')}
            className={`px-6 py-3 text-lg font-medium transition-colors duration-300 ${
              view === 'userAssessment'
                ? 'text-cyan-400 border-b-2 border-cyan-400'
                : 'text-gray-400 hover:text-cyan-300'
            }`}
          >
            My Assessment
          </button>
        </nav>

        <div className="max-w-4xl mx-auto">
          {view === 'publicFigure' && <PublicFigureAnalysis userProfile={userProfile} />}
          {view === 'userAssessment' && <UserAssessment onProfileGenerated={setUserProfile} initialProfile={userProfile} />}
        </div>
      </main>
    </div>
  );
};

export default App;