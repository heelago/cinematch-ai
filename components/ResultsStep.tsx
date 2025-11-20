import React, { useState, useEffect } from 'react';
import { MovieSuggestion } from '../types';

interface ResultsStepProps {
  suggestions: MovieSuggestion[];
  onReset: () => void;
  onReplaceMovie: (index: number) => void;
  replacingIndices: number[];
}

const MovieCard: React.FC<{
  movie: MovieSuggestion;
  onReplace: () => void;
  isReplacing: boolean;
}> = ({ movie, onReplace, isReplacing }) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageLoading, setImageLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchPoster = async () => {
      if (!movie.wikipediaTitle) return;
      setImageLoading(true);
      try {
        // Fetch image from Wikipedia API
        const response = await fetch(
          `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(
            movie.wikipediaTitle
          )}&prop=pageimages&format=json&pithumbsize=600&origin=*`
        );
        const data = await response.json();
        const pages = data.query?.pages;
        if (pages) {
          const pageId = Object.keys(pages)[0];
          const url = pages[pageId]?.thumbnail?.source;
          if (isMounted && url) {
            setImageUrl(url);
          } else if (isMounted) {
            setImageUrl(null);
          }
        }
      } catch (error) {
        console.error("Error fetching image", error);
        if (isMounted) setImageUrl(null);
      } finally {
        if (isMounted) setImageLoading(false);
      }
    };

    fetchPoster();
    return () => { isMounted = false; };
  }, [movie.wikipediaTitle]);

  return (
    <div className="glass-panel rounded-2xl p-6 md:p-8 flex flex-col md:flex-row gap-6 hover:bg-white/5 transition-colors duration-300 border border-white/5 group relative overflow-hidden">
      {isReplacing && (
        <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center">
           <div className="flex flex-col items-center animate-pulse">
             <span className="text-indigo-400 font-bold mb-2">Finding alternative...</span>
             <svg className="animate-spin h-6 w-6 text-indigo-500" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
             </svg>
           </div>
        </div>
      )}

      <div className="flex-shrink-0 w-full md:w-40 h-56 bg-zinc-800 rounded-lg flex items-center justify-center overflow-hidden relative shadow-2xl group-hover:shadow-indigo-500/10 transition-shadow">
         {imageUrl ? (
            <img 
              src={imageUrl} 
              alt={movie.title} 
              className={`w-full h-full object-cover transition-opacity duration-700 ${imageLoading ? 'opacity-0' : 'opacity-100'}`}
            />
         ) : (
            <>
                <div className="absolute inset-0 bg-gradient-to-br from-zinc-700 to-zinc-900"></div>
                <span className="relative z-10 text-4xl font-bold text-zinc-600 select-none heading-font">
                    {movie.title.slice(0,1)}
                </span>
            </>
         )}
         
         {/* RT Score Badge */}
         <div className="absolute top-2 right-2 bg-black/80 backdrop-blur-sm px-2 py-1 rounded border border-red-500/30 flex items-center gap-1 shadow-lg z-20">
           <span className="text-red-500 text-xs">🍅</span>
           <span className="text-white font-bold text-sm">{movie.rtScore}</span>
         </div>
      </div>

      <div className="flex-1 flex flex-col justify-center">
        <div className="flex flex-wrap items-baseline justify-between gap-2 mb-2">
          <h3 className="text-2xl md:text-3xl font-bold text-white heading-font group-hover:text-indigo-400 transition-colors">
            {movie.title}
          </h3>
          <span className="text-zinc-500 font-mono text-sm border border-zinc-700 px-2 py-0.5 rounded">
            {movie.year}
          </span>
        </div>

        <p className="text-gray-300 leading-relaxed mb-4">
          {movie.description}
        </p>

        <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-4 mb-4">
          <p className="text-sm text-indigo-200">
            <strong className="text-indigo-400 block mb-1 uppercase text-xs tracking-wider">Why it fits:</strong>
            {movie.reasoning}
          </p>
        </div>

        <div className="flex justify-end">
             <button 
               onClick={onReplace}
               disabled={isReplacing}
               className="text-xs text-zinc-500 hover:text-white flex items-center gap-1 transition-colors group/btn"
             >
                <span className="group-hover/btn:underline">Seen it? Get another</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/><path d="M16 21h5v-5"/></svg>
             </button>
        </div>
      </div>
    </div>
  );
};

const ResultsStep: React.FC<ResultsStepProps> = ({ suggestions, onReset, onReplaceMovie, replacingIndices }) => {
  return (
    <div className="w-full max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-1000 pb-10">
      <div className="text-center mb-12">
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 heading-font">
          Your Curated Watchlist
        </h2>
        <p className="text-gray-400">
          Based on your taste profile and critical consensus.
        </p>
      </div>

      <div className="grid gap-6 md:gap-8">
        {suggestions.map((movie, index) => (
          <MovieCard 
            key={`${movie.title}-${index}`} // Use title in key to force re-render/re-fetch when movie changes
            movie={movie} 
            onReplace={() => onReplaceMovie(index)}
            isReplacing={replacingIndices.includes(index)}
          />
        ))}
      </div>

      <div className="mt-16 text-center">
        <button
          onClick={onReset}
          className="px-8 py-3 rounded-full border border-zinc-700 text-zinc-300 hover:bg-white hover:text-black hover:border-white transition-all duration-300"
        >
          Start Over
        </button>
      </div>
    </div>
  );
};

export default ResultsStep;