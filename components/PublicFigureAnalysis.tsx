import React, { useState, useCallback, useEffect } from 'react';
import { analyzePublicFigure, analyzeBias, getSurpriseFigure, JsonParseError } from '../services/geminiService';
import { getAnalysisFromCache, saveAnalysisToCache, getSearchHistory } from '../utils/cache';
import { AuthenticityAnalysis } from '../types';
import RadarChartComponent from './RadarChart';
import Loader from './Loader';
import { DIMENSION_DESCRIPTIONS } from '../constants';

interface PublicFigureAnalysisProps {
  userProfile: string | null;
}

const PublicFigureAnalysis: React.FC<PublicFigureAnalysisProps> = ({ userProfile }) => {
  const [name, setName] = useState<string>('');
  const [analysis, setAnalysis] = useState<AuthenticityAnalysis | null>(null);
  const [biasAnalysis, setBiasAnalysis] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [logs, setLogs] = useState<string[]>([]);
  const [isLogOpen, setIsLogOpen] = useState(false);

  useEffect(() => {
    setSearchHistory(getSearchHistory());
  }, []);
  
  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const handleAnalysis = async (figureName: string) => {
    const trimmedName = figureName.trim();
    if (!trimmedName) return;

    setIsLoading(true);
    setError(null);
    setAnalysis(null);
    setBiasAnalysis(null);
    setName(trimmedName);
    setLogs([]);
    addLog(`Starting analysis for "${trimmedName}"...`);

    try {
      addLog("Checking local cache.");
      const cachedResult = getAnalysisFromCache(trimmedName);
      
      if (cachedResult) {
        addLog("Cache hit. Loading from local storage.");
        setAnalysis(cachedResult);
      } else {
        addLog("Cache miss. Calling Gemini API.");
        const { analysis, rawText } = await analyzePublicFigure(trimmedName);
        addLog("API call successful.");
        addLog("--- RAW AI RESPONSE ---");
        addLog(rawText || "Raw response was empty.");
        addLog("--- END RAW AI RESPONSE ---");
        
        addLog("Parsing from service was successful.");
        saveAnalysisToCache(trimmedName, analysis);
        addLog("Analysis saved to cache.");
        setSearchHistory(getSearchHistory());
        setAnalysis(analysis);
      }
      addLog("Analysis complete.");
    } catch (err) {
      addLog("An error occurred during analysis.");
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(`Failed to get analysis: ${errorMessage}`);
      console.error(err);

      if (err instanceof JsonParseError) {
        addLog("Error was due to JSON parsing failure.");
        addLog("--- RAW AI RESPONSE ---");
        addLog(err.rawResponse || "Raw response was empty.");
        addLog("--- END RAW AI RESPONSE ---");
      }
    } finally {
      setIsLoading(false);
      addLog("Process finished.");
    }
  };
  
  const handleSurpriseMe = async () => {
    setIsLoading(true);
    setError(null);
    setAnalysis(null);
    setBiasAnalysis(null);
    setLogs([]);
    addLog("Requesting a surprise suggestion...");

    try {
      const figureName = await getSurpriseFigure();
      addLog(`AI suggested: "${figureName}".`);
      setName(figureName); 
      await handleAnalysis(figureName);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      addLog(`Error during surprise me: ${errorMessage}`);
      setError(`Failed to get a suggestion: ${errorMessage}`);
      console.error(err);
      setIsLoading(false);
    }
  };
  
  const generateBiasAnalysis = useCallback(async () => {
    if (userProfile && analysis) {
        setIsLoading(true);
        try {
            const biasResult = await analyzeBias(userProfile, analysis);
            setBiasAnalysis(biasResult);
        } catch(err) {
            console.error("Failed to generate bias analysis:", err);
        } finally {
            setIsLoading(false);
        }
    }
  }, [userProfile, analysis]);

  useEffect(() => {
      if (analysis && userProfile) {
          generateBiasAnalysis();
      }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [analysis, userProfile]);


  const renderDimension = (key: string, data: any) => (
    <div key={key} className="bg-gray-800 p-4 rounded-lg">
      <h4 className="text-lg font-semibold text-cyan-400 capitalize">{key.replace(/_/g, ' ')}</h4>
      <p className="text-sm text-gray-400 mb-3">{DIMENSION_DESCRIPTIONS[key]}</p>
      <p className="text-2xl font-bold text-white">{data.score} / 10</p>
      <ul className="mt-2 list-disc list-inside text-gray-300 space-y-1">
        {data.evidence.map((item: string, index: number) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="bg-gray-800/50 p-6 rounded-xl shadow-lg border border-gray-700">
        <h2 className="text-2xl font-bold mb-4 text-white">Analyze a Public Figure</h2>
        <div className="flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAnalysis(name)}
            placeholder="e.g., Anthony Hopkins"
            className="flex-grow bg-gray-700 border border-gray-600 text-white rounded-md px-4 py-2 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
          />
          <button
            onClick={() => handleAnalysis(name)}
            disabled={isLoading}
            className="bg-cyan-600 hover:bg-cyan-500 disabled:bg-cyan-800 disabled:cursor-not-allowed text-white font-bold py-2 px-6 rounded-md transition-all duration-300 transform hover:scale-105"
          >
            {isLoading ? 'Analyzing...' : 'Analyze'}
          </button>
          <button
            onClick={handleSurpriseMe}
            disabled={isLoading}
            className="bg-purple-600 hover:bg-purple-500 disabled:bg-purple-800 disabled:cursor-not-allowed text-white font-bold py-2 px-4 rounded-md transition-all duration-300"
          >
            Surprise Me!
          </button>
        </div>
        {searchHistory.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm text-gray-400 mb-2">Recent Searches:</h4>
            <div className="flex flex-wrap gap-2">
              {searchHistory.map(item => (
                <button 
                  key={item}
                  onClick={() => handleAnalysis(item)}
                  className="bg-gray-700 hover:bg-gray-600 text-gray-200 text-sm py-1 px-3 rounded-full transition-colors"
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {isLoading && !analysis && <Loader />}
      {error && <div className="text-red-400 bg-red-900/50 p-4 rounded-md">{error}</div>}

      {analysis && (
        <div className="space-y-8 animate-fade-in">
          <div className="bg-gray-800/50 p-6 rounded-xl shadow-lg border border-gray-700">
             <h3 className="text-3xl font-bold text-center mb-6 text-white">{analysis.name}</h3>
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h4 className="text-xl font-semibold mb-2 text-cyan-400">Narrative Summary</h4>
                <p className="text-gray-300 leading-relaxed">{analysis.narrative_summary || "No summary was provided by the AI."}</p>
              </div>
              <div className="h-80 md:h-96">
                {analysis.authenticity_analysis && <RadarChartComponent data={analysis.authenticity_analysis} />}
              </div>
            </div>
          </div>
          
           {biasAnalysis && (
                <div className="bg-gradient-to-r from-purple-900/50 to-cyan-900/50 p-6 rounded-xl border border-purple-700 animate-fade-in">
                    <h4 className="text-xl font-semibold mb-2 text-purple-300">Your Potential Bias Influence</h4>
                    <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{biasAnalysis}</p>
                </div>
            )}

            {isLoading && !biasAnalysis && userProfile && (
                <div className="flex justify-center items-center gap-3 text-purple-300">
                    <Loader />
                    <span>Analyzing your potential bias...</span>
                </div>
            )}
          
          <div className="grid md:grid-cols-2 gap-6">
            {analysis.authenticity_analysis && Object.entries(analysis.authenticity_analysis).map(([key, value]) => renderDimension(key, value))}
          </div>
        </div>
      )}

      {logs.length > 0 && (
        <div className="mt-8">
          <div className="border border-gray-700 rounded-lg bg-gray-800/50">
            <button
              onClick={() => setIsLogOpen(!isLogOpen)}
              className="w-full flex justify-between items-center p-4 text-left font-semibold text-white focus:outline-none"
            >
              <span>Raw Logs</span>
              <span className={`transform transition-transform duration-300 ${isLogOpen ? 'rotate-180' : ''}`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </span>
            </button>
            {isLogOpen && (
              <div className="p-4 border-t border-gray-700 text-gray-300 animate-fade-in">
                <pre className="text-xs whitespace-pre-wrap bg-gray-900 p-3 rounded-md font-mono">{logs.join('\n')}</pre>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PublicFigureAnalysis;