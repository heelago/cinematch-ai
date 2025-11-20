import React from 'react';

interface YearSelectionStepProps {
  yearRange: [number, number];
  setYearRange: (range: [number, number]) => void;
  onNext: () => void;
  loading: boolean;
}

const YearSelectionStep: React.FC<YearSelectionStepProps> = ({
  yearRange,
  setYearRange,
  onNext,
  loading,
}) => {
  const MIN_YEAR = 1950;
  const MAX_YEAR = new Date().getFullYear();

  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Math.min(Number(e.target.value), yearRange[1] - 1);
    setYearRange([val, yearRange[1]]);
  };

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Math.max(Number(e.target.value), yearRange[0] + 1);
    setYearRange([yearRange[0], val]);
  };

  return (
    <div className="flex flex-col items-center w-full max-w-lg mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
      <h2 className="text-3xl md:text-4xl font-bold text-white mb-2 heading-font text-center">
        Set the era.
      </h2>
      <p className="text-gray-400 mb-12 text-center">
        From which time period should we fetch suggestions?
      </p>

      <div className="w-full bg-zinc-900/80 p-8 rounded-2xl border border-zinc-800 shadow-2xl">
        <div className="flex justify-between items-center mb-8">
          <div className="text-center">
             <span className="block text-xs text-zinc-500 uppercase tracking-wider mb-1">From</span>
             <span className="text-3xl font-bold text-indigo-400">{yearRange[0]}</span>
          </div>
          <div className="h-px flex-1 bg-zinc-700 mx-6"></div>
          <div className="text-center">
             <span className="block text-xs text-zinc-500 uppercase tracking-wider mb-1">To</span>
             <span className="text-3xl font-bold text-indigo-400">{yearRange[1]}</span>
          </div>
        </div>

        <div className="relative w-full h-12 flex items-center">
            {/* Simple Range Implementation */}
            <input
                type="range"
                min={MIN_YEAR}
                max={MAX_YEAR}
                value={yearRange[0]}
                onChange={handleMinChange}
                className="absolute pointer-events-auto w-full h-2 bg-transparent appearance-none z-20 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:cursor-pointer"
                style={{ zIndex: 20 }}
            />
            <input
                type="range"
                min={MIN_YEAR}
                max={MAX_YEAR}
                value={yearRange[1]}
                onChange={handleMaxChange}
                className="absolute pointer-events-auto w-full h-2 bg-transparent appearance-none z-10 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:cursor-pointer"
            />
            
            {/* Track Background */}
            <div className="absolute w-full h-2 bg-zinc-700 rounded-full z-0"></div>
             {/* Active Track */}
            <div 
                className="absolute h-2 bg-indigo-600 rounded-full z-0"
                style={{
                    left: `${((yearRange[0] - MIN_YEAR) / (MAX_YEAR - MIN_YEAR)) * 100}%`,
                    right: `${100 - ((yearRange[1] - MIN_YEAR) / (MAX_YEAR - MIN_YEAR)) * 100}%`
                }}
            ></div>
        </div>
        <p className="text-center text-xs text-zinc-500 mt-6">Drag sliders to adjust range</p>
      </div>

      <button
        onClick={onNext}
        disabled={loading}
        className="mt-12 w-full py-4 rounded-xl font-bold text-lg tracking-wide bg-white text-black hover:bg-indigo-50 hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(255,255,255,0.3)] transition-all duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
             <span className="flex items-center justify-center gap-2">
             <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
               <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
               <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
             </svg>
             Finding Movies...
           </span>
        ) : (
            "Get Suggestions"
        )}
      </button>
    </div>
  );
};

export default YearSelectionStep;
