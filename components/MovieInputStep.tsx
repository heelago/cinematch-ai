import React from 'react';

interface MovieInputStepProps {
  movies: string[];
  setMovies: (movies: string[]) => void;
  onNext: () => void;
  loading: boolean;
}

const MovieInputStep: React.FC<MovieInputStepProps> = ({ movies, setMovies, onNext, loading }) => {
  const handleChange = (index: number, value: string) => {
    const newMovies = [...movies];
    newMovies[index] = value;
    setMovies(newMovies);
  };

  const isNextDisabled = movies.some((m) => m.trim() === '') || loading;

  return (
    <div className="flex flex-col items-center w-full max-w-md mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
      <h2 className="text-3xl md:text-4xl font-bold text-white mb-2 heading-font text-center">
        Tell us what you love.
      </h2>
      <p className="text-gray-400 mb-8 text-center">
        Enter three movies that really made an impression on you.
      </p>

      <div className="w-full space-y-4">
        {movies.map((movie, index) => (
          <div key={index} className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
            <input
              type="text"
              value={movie}
              onChange={(e) => handleChange(index, e.target.value)}
              placeholder={`Movie #${index + 1} (e.g. ${index === 0 ? 'Interstellar' : index === 1 ? 'The Matrix' : 'Arrival'})`}
              className="relative w-full bg-zinc-900 text-white border border-zinc-700 rounded-lg p-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder-zinc-600 shadow-xl transition-all"
            />
          </div>
        ))}
      </div>

      <button
        onClick={onNext}
        disabled={isNextDisabled}
        className={`mt-10 w-full py-4 rounded-xl font-bold text-lg tracking-wide transition-all duration-300 shadow-lg
          ${
            isNextDisabled
              ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
              : 'bg-white text-black hover:bg-indigo-50 hover:scale-[1.02] hover:shadow-indigo-500/20'
          }
        `}
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Analyzing...
          </span>
        ) : (
          'Analyze Taste'
        )}
      </button>
    </div>
  );
};

export default MovieInputStep;
