import React, { useState, useCallback } from 'react';
import { AppStep, MovieSuggestion } from './types';
import { generateTagsFromMovies, getMovieSuggestions, getReplacementSuggestion } from './services/geminiService';
import MovieInputStep from './components/MovieInputStep';
import TagSelectionStep from './components/TagSelectionStep';
import YearSelectionStep from './components/YearSelectionStep';
import ResultsStep from './components/ResultsStep';

const App: React.FC = () => {
  const [step, setStep] = useState<AppStep>(AppStep.INPUT_MOVIES);
  const [movies, setMovies] = useState<string[]>(['', '', '']);
  const [generatedTags, setGeneratedTags] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [yearRange, setYearRange] = useState<[number, number]>([1980, new Date().getFullYear()]);
  const [suggestions, setSuggestions] = useState<MovieSuggestion[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  
  // Track indices currently being replaced to show specific loading states
  const [replacingIndices, setReplacingIndices] = useState<number[]>([]);

  const handleAnalyzeMovies = useCallback(async () => {
    setLoading(true);
    try {
      const tags = await generateTagsFromMovies(movies);
      setGeneratedTags(tags);
      setStep(AppStep.SELECT_TAGS);
    } catch (error) {
      console.error("Failed to generate tags", error);
    } finally {
      setLoading(false);
    }
  }, [movies]);

  const handleGetSuggestions = useCallback(async () => {
    setLoading(true);
    try {
      const results = await getMovieSuggestions(movies, selectedTags, yearRange);
      setSuggestions(results);
      setStep(AppStep.RESULTS);
    } catch (error) {
      console.error("Failed to get suggestions", error);
    } finally {
      setLoading(false);
    }
  }, [movies, selectedTags, yearRange]);

  const handleReplaceMovie = async (index: number) => {
    if (replacingIndices.includes(index)) return;

    setReplacingIndices(prev => [...prev, index]);
    const movieToReplace = suggestions[index];

    try {
      // Build list of all movies to exclude: inputs + current suggestions + replaced movie
      const currentTitles = suggestions.map(s => s.title);
      const excluded = [...movies, ...currentTitles, movieToReplace.title];
      
      const newSuggestion = await getReplacementSuggestion(excluded, selectedTags, yearRange);
      
      if (newSuggestion) {
        setSuggestions(prev => {
          const next = [...prev];
          next[index] = newSuggestion;
          return next;
        });
      }
    } catch (error) {
      console.error("Error replacing movie", error);
    } finally {
      setReplacingIndices(prev => prev.filter(i => i !== index));
    }
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => {
      if (prev.includes(tag)) {
        return prev.filter(t => t !== tag);
      } else {
        if (prev.length >= 5) return prev;
        return [...prev, tag];
      }
    });
  };

  const handleReset = () => {
    setStep(AppStep.INPUT_MOVIES);
    setMovies(['', '', '']);
    setGeneratedTags([]);
    setSelectedTags([]);
    setSuggestions([]);
    setReplacingIndices([]);
  };

  return (
    <div className="min-h-screen w-full bg-black text-white overflow-x-hidden selection:bg-indigo-500 selection:text-white">
      {/* Dynamic Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-900/20 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-900/20 rounded-full blur-[120px]"></div>
        <div className="absolute top-[20%] left-[30%] w-[20%] h-[20%] bg-blue-900/10 rounded-full blur-[100px]"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 p-6 flex justify-between items-center max-w-6xl mx-auto">
        <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <span className="text-white font-bold text-xl font-serif">C</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight heading-font">CineMatch AI</h1>
        </div>
        {step !== AppStep.INPUT_MOVIES && step !== AppStep.RESULTS && (
             <button onClick={handleReset} className="text-sm text-zinc-500 hover:text-white transition-colors">Restart</button>
        )}
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-80px)] px-4 py-10">
        
        {/* Step Indicator (Optional, for visual flair) */}
        {step !== AppStep.RESULTS && (
            <div className="flex items-center gap-3 mb-12">
                {[0, 1, 2].map((s) => (
                    <div 
                        key={s} 
                        className={`h-1.5 rounded-full transition-all duration-500 ${s === step ? 'w-8 bg-indigo-500' : s < step ? 'w-1.5 bg-indigo-900' : 'w-1.5 bg-zinc-800'}`}
                    />
                ))}
            </div>
        )}

        {step === AppStep.INPUT_MOVIES && (
          <MovieInputStep 
            movies={movies} 
            setMovies={setMovies} 
            onNext={handleAnalyzeMovies} 
            loading={loading} 
          />
        )}

        {step === AppStep.SELECT_TAGS && (
          <TagSelectionStep 
            generatedTags={generatedTags} 
            selectedTags={selectedTags} 
            toggleTag={toggleTag} 
            onNext={() => setStep(AppStep.SELECT_YEARS)} 
          />
        )}

        {step === AppStep.SELECT_YEARS && (
          <YearSelectionStep 
            yearRange={yearRange} 
            setYearRange={setYearRange} 
            onNext={handleGetSuggestions} 
            loading={loading} 
          />
        )}

        {step === AppStep.RESULTS && (
          <ResultsStep 
            suggestions={suggestions} 
            onReset={handleReset}
            onReplaceMovie={handleReplaceMovie}
            replacingIndices={replacingIndices}
          />
        )}
      </main>
    </div>
  );
};

export default App;