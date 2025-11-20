import React from 'react';

interface TagSelectionStepProps {
  generatedTags: string[];
  selectedTags: string[];
  toggleTag: (tag: string) => void;
  onNext: () => void;
}

const TagSelectionStep: React.FC<TagSelectionStepProps> = ({
  generatedTags,
  selectedTags,
  toggleTag,
  onNext,
}) => {
  const MAX_SELECTION = 5;
  const isNextDisabled = selectedTags.length === 0;

  return (
    <div className="flex flex-col items-center w-full max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
      <h2 className="text-3xl md:text-4xl font-bold text-white mb-2 heading-font text-center">
        What hooked you?
      </h2>
      <p className="text-gray-400 mb-8 text-center">
        Select up to {MAX_SELECTION} elements that you enjoyed the most.
      </p>

      <div className="flex flex-wrap justify-center gap-3 mb-8">
        {generatedTags.map((tag) => {
          const isSelected = selectedTags.includes(tag);
          const isDisabled = !isSelected && selectedTags.length >= MAX_SELECTION;

          return (
            <button
              key={tag}
              onClick={() => toggleTag(tag)}
              disabled={isDisabled}
              className={`
                px-5 py-2.5 rounded-full text-sm font-medium border transition-all duration-300
                ${
                  isSelected
                    ? 'bg-indigo-600 border-indigo-500 text-white shadow-[0_0_15px_rgba(79,70,229,0.5)] scale-105'
                    : isDisabled
                    ? 'bg-zinc-900/50 border-zinc-800 text-zinc-600 cursor-not-allowed'
                    : 'bg-zinc-900 border-zinc-700 text-zinc-300 hover:border-zinc-500 hover:bg-zinc-800'
                }
              `}
            >
              {tag}
            </button>
          );
        })}
      </div>

      <div className="text-sm text-gray-500 mb-8 h-6">
         {selectedTags.length} / {MAX_SELECTION} selected
      </div>

      <button
        onClick={onNext}
        disabled={isNextDisabled}
        className={`w-full max-w-xs py-4 rounded-xl font-bold text-lg tracking-wide transition-all duration-300 shadow-lg
          ${
            isNextDisabled
              ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
              : 'bg-white text-black hover:bg-indigo-50 hover:scale-[1.02] hover:shadow-indigo-500/20'
          }
        `}
      >
        Next Step
      </button>
    </div>
  );
};

export default TagSelectionStep;
