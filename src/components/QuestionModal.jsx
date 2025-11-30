import React, { useState } from 'react';
import { Check, X } from 'lucide-react';

const QuestionModal = ({ currentClue, handleAnswer, feedback, onClose, timer, isPaused }) => { // Added timer prop, isPaused
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = () => {
    setIsClosing(true);
  };

  if (!currentClue && !isClosing) {
    return null;
  }

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200 ${isClosing ? 'fade-out' : ''}`}
      onAnimationEnd={() => {
        if (isClosing) {
          onClose();
          setIsClosing(false);
        }
      }}
    >
      {currentClue && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden transform transition-all scale-100">
          <div className="bg-indigo-700 p-6 flex justify-between items-center">
            <span className="text-indigo-200 font-bold tracking-widest uppercase text-sm">
              Difficulty Level {currentClue.level}
            </span>
            <div className="flex items-center space-x-4">
              {isPaused ? (
                <span className="font-black text-2xl text-yellow-400">Paused</span>
              ) : (
                <span className={`font-black text-2xl tabular-nums ${timer <= 5 ? 'text-red-400 animate-pulse' : 'text-white'}`}>
                  {timer}s
                </span>
              )}
              <button onClick={handleClose} className="text-white hover:bg-indigo-600 p-1 rounded-full">
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          <div className="p-8 text-center">
            {isPaused ? (
              <h3 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mb-8">Game Paused</h3>
            ) : (
              <h3 className="text-xl md:text-2xl font-serif text-slate-800 dark:text-gray-100 mb-8 leading-relaxed">
                {currentClue.question}
              </h3>
            )}

            {feedback ? (
              <div className={`flex flex-col items-center justify-center py-6 animate-in zoom-in duration-300 ${feedback === 'correct' ? 'text-green-600' : 'text-red-500'}`}>
                {feedback === 'correct' ? (
                  <>
                    <Check className="w-16 h-16 mb-2" />
                    <span className="text-2xl font-bold">Correct!</span>
                  </>
                ) : (
                  <>
                    <X className="w-16 h-16 mb-2" />
                    <div className="text-center">
                      <span className="text-2xl font-bold block">Incorrect</span>
                      <span className="text-slate-500 dark:text-gray-300 text-lg mt-2">Answer: {currentClue.answer}</span>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentClue.options.map((option, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleAnswer(option)}
                    disabled={isPaused} // Disable when paused
                    className={`
                      p-4 rounded-xl border-2 border-slate-100 dark:border-gray-700 bg-slate-50 dark:bg-gray-700 text-slate-700 dark:text-gray-100 font-semibold transition-all text-sm md:text-base text-left
                      ${isPaused ? 'opacity-50 cursor-not-allowed' : 'hover:border-indigo-500 dark:hover:border-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-600'}
                    `}
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestionModal;
