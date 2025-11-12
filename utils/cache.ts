import { AuthenticityAnalysis, CachedAnalyses } from '../types';

const ANALYSIS_CACHE_KEY = 'analysis_cache';

const getCache = (): CachedAnalyses => {
  try {
    const cachedRaw = localStorage.getItem(ANALYSIS_CACHE_KEY);
    return cachedRaw ? JSON.parse(cachedRaw) : {};
  } catch (error) {
    console.error("Failed to read from cache", error);
    return {};
  }
};

export const getAnalysisFromCache = (name: string): AuthenticityAnalysis | null => {
  const normalizedName = name.trim().toLowerCase();
  const cache = getCache();
  return cache[normalizedName] || null;
};

export const saveAnalysisToCache = (name: string, analysis: AuthenticityAnalysis) => {
  const normalizedName = name.trim().toLowerCase();
  const cache = getCache();
  cache[normalizedName] = analysis;
  try {
    localStorage.setItem(ANALYSIS_CACHE_KEY, JSON.stringify(cache));
  } catch (error) {
    console.error("Failed to save to cache", error);
  }
};

export const getSearchHistory = (): string[] => {
  const cache = getCache();
  return Object.values(cache).map(item => item.name);
};