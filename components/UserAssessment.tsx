import React, { useState, useEffect } from 'react';
import { USER_ASSESSMENT_QUESTIONS } from '../constants';
import { UserAnswers, EncryptedData } from '../types';
import { analyzeUser } from '../services/geminiService';
import { encryptData, decryptData } from '../utils/crypto';
import Loader from './Loader';

const ENCRYPTED_PROFILE_KEY = 'user_profile_encrypted';

interface UserAssessmentProps {
  onProfileGenerated: (profile: string | null) => void;
  initialProfile: string | null;
}

type ViewState = 'questionnaire' | 'generating' | 'profile_ready' | 'locked' | 'unlocked';

const UserAssessment: React.FC<UserAssessmentProps> = ({ onProfileGenerated, initialProfile }) => {
  const [answers, setAnswers] = useState<UserAnswers>({});
  const [viewState, setViewState] = useState<ViewState>('questionnaire');
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<string | null>(initialProfile);
  const [passphrase, setPassphrase] = useState('');

  useEffect(() => {
    if (initialProfile) {
        setViewState('unlocked');
        return;
    }
    try {
      const storedProfile = localStorage.getItem(ENCRYPTED_PROFILE_KEY);
      if (storedProfile) {
        setViewState('locked');
      } else {
        setViewState('questionnaire');
      }
    } catch (e) {
        console.error("Could not access local storage", e);
        setViewState('questionnaire');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAnswerChange = (questionId: string, answer: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const handleGenerateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (Object.keys(answers).length !== USER_ASSESSMENT_QUESTIONS.length) {
      setError('Please answer all questions.');
      return;
    }
    setError(null);
    setViewState('generating');
    
    try {
      const userProfile = await analyzeUser(answers);
      setProfile(userProfile);
      onProfileGenerated(userProfile);
      setViewState('profile_ready');
    } catch (err) {
      console.error(err);
      setError('Failed to generate your profile. Please try again.');
      setViewState('questionnaire');
    }
  };

  const handleSaveAndEncrypt = async () => {
    if (!profile || !passphrase) {
        setError("Passphrase cannot be empty.");
        return;
    }
    setError(null);
    try {
        const encrypted = await encryptData(profile, passphrase);
        localStorage.setItem(ENCRYPTED_PROFILE_KEY, JSON.stringify(encrypted));
        setViewState('unlocked');
    } catch(err) {
        console.error(err);
        setError("Failed to save profile. Please try again.");
    }
  };

  const handleUnlock = async () => {
      if (!passphrase) {
          setError("Please enter your passphrase.");
          return;
      }
      setError(null);
      try {
          const storedProfileRaw = localStorage.getItem(ENCRYPTED_PROFILE_KEY);
          if (!storedProfileRaw) {
              setError("No saved profile found.");
              setViewState('questionnaire');
              return;
          }
          const storedProfile: EncryptedData = JSON.parse(storedProfileRaw);
          const decryptedProfile = await decryptData(storedProfile, passphrase);
          setProfile(decryptedProfile);
          onProfileGenerated(decryptedProfile);
          setViewState('unlocked');
          setPassphrase('');
      } catch (err) {
          setError("Failed to unlock. Please check your passphrase.");
      }
  };

  const handleClearProfile = () => {
      localStorage.removeItem(ENCRYPTED_PROFILE_KEY);
      setProfile(null);
      onProfileGenerated(null);
      setAnswers({});
      setPassphrase('');
      setError(null);
      setViewState('questionnaire');
  };


  const renderContent = () => {
    switch(viewState) {
        case 'locked':
            return (
                <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-cyan-400">Unlock Your Profile</h3>
                    <p className="text-gray-400">Enter your passphrase to access your saved assessment.</p>
                    <div className="flex flex-col sm:flex-row gap-4">
                         <input
                            type="password"
                            value={passphrase}
                            onChange={(e) => setPassphrase(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleUnlock()}
                            placeholder="Enter your passphrase"
                            className="flex-grow bg-gray-700 border border-gray-600 text-white rounded-md px-4 py-2 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                        />
                        <button onClick={handleUnlock} className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-6 rounded-md">Unlock</button>
                    </div>
                     {error && <p className="text-red-400">{error}</p>}
                     <button onClick={handleClearProfile} className="text-sm text-gray-500 hover:text-red-400">Forgot passphrase? (This will clear your saved profile)</button>
                </div>
            );
        
        case 'unlocked':
        case 'profile_ready':
            return (
                <div className="animate-fade-in space-y-4">
                    <h3 className="text-xl font-semibold text-cyan-400">Your Perspective Profile</h3>
                    <div className="bg-gray-800 p-6 rounded-lg text-gray-300 leading-relaxed whitespace-pre-wrap">{profile}</div>
                    {viewState === 'profile_ready' && (
                         <div className="bg-gray-700/50 p-4 rounded-lg space-y-3">
                             <h4 className="font-semibold text-white">Save Your Profile</h4>
                             <p className="text-sm text-gray-300">Create a passphrase to encrypt and save this profile in your browser for future sessions.</p>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <input
                                    type="password"
                                    value={passphrase}
                                    onChange={(e) => setPassphrase(e.target.value)}
                                    placeholder="Create a passphrase"
                                    className="flex-grow bg-gray-900 border border-gray-600 text-white rounded-md px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                                />
                                <button onClick={handleSaveAndEncrypt} className="bg-purple-600 hover:bg-purple-500 text-white font-bold py-2 px-6 rounded-md">Save & Encrypt</button>
                            </div>
                            {error && <p className="text-red-400">{error}</p>}
                        </div>
                    )}
                    <button onClick={handleClearProfile} className="text-cyan-400 hover:text-cyan-300">Start New Assessment</button>
                </div>
            );

        case 'generating':
            return <Loader />;

        case 'questionnaire':
        default:
             return (
                <>
                <h2 className="text-2xl font-bold mb-2 text-white">Discover Your Perspective</h2>
                <p className="text-gray-400 mb-6">Answer these questions to understand your own leanings and how they might influence your perception of others. This is entirely for your insight.</p>
                <form onSubmit={handleGenerateSubmit} className="space-y-6">
                {USER_ASSESSMENT_QUESTIONS.map(({ id, question, options }) => (
                    <fieldset key={id} className="bg-gray-800 p-4 rounded-lg">
                    <legend className="text-lg font-medium text-gray-200 mb-3">{question}</legend>
                    <div className="space-y-2">
                        {options.map(option => (
                        <label key={option} className="flex items-center p-3 rounded-md hover:bg-gray-700/50 cursor-pointer transition-colors">
                            <input
                            type="radio"
                            name={id}
                            value={option}
                            checked={answers[id] === option}
                            onChange={() => handleAnswerChange(id, option)}
                            className="h-4 w-4 text-cyan-600 bg-gray-700 border-gray-600 focus:ring-cyan-500"
                            />
                            <span className="ml-3 text-gray-300">{option}</span>
                        </label>
                        ))}
                    </div>
                    </fieldset>
                ))}
                {error && <p className="text-red-400">{error}</p>}
                <div className="flex justify-end">
                    <button
                    type="submit"
                    className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-6 rounded-md transition-all duration-300 transform hover:scale-105"
                    >
                    Generate My Profile
                    </button>
                </div>
                </form>
                </>
            );
    }
  }


  return (
    <div className="bg-gray-800/50 p-6 rounded-xl shadow-lg border border-gray-700">
      {renderContent()}
    </div>
  );
};

export default UserAssessment;