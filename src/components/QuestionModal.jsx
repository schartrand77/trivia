import React, { useState, useEffect, useMemo } from 'react';
import { Check, X, SkipForward } from 'lucide-react';

const Confetti = ({ isActive }) => {
  const [key, setKey] = useState(0);

  useEffect(() => {
    if (isActive) {
      const interval = setInterval(() => {
        setKey(prevKey => prevKey + 1);
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [isActive]);

  const confetti = useMemo(() => {
    if (!isActive) return [];
    return Array.from({ length: 150 }, (_, i) => {
      const fromLeft = Math.random() > 0.5;
      const angle = fromLeft ? Math.random() * 90 - 45 : Math.random() * 90 + 135; // from left or right
      const spread = window.innerWidth / 4;
      const endX = Math.cos(angle * Math.PI / 180) * spread;
      const endY = Math.sin(angle * Math.PI / 180) * spread + (window.innerHeight / 4);
      const duration = 3 + Math.random() * 2;
      const delay = Math.random() * 0.2;
      const size = 8 + Math.random() * 8;
      const rotation = Math.random() * 720 - 360;

      return {
        id: `${key}-${i}`,
        style: {
          width: `${size}px`,
          height: `${size}px`,
          top: '40%', // from vertical center
          left: fromLeft ? '5%' : '95%',
          '--end-x': `${endX}px`,
          '--end-y': `${endY}px`,
          '--rotation': `${rotation}deg`,
          animationDuration: `${duration}s`,
          animationDelay: `${delay}s`,
        },
        color: ['bg-yellow-400', 'bg-green-400', 'bg-blue-400', 'bg-pink-400', 'bg-purple-400'][Math.floor(Math.random() * 5)],
      };
    });
  }, [isActive, key]);

  if (!isActive) return null;

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-[100]">
      {confetti.map((piece) => (
        <div
          key={piece.id}
          className={`absolute ${piece.color} rounded-full`}
          style={{
            ...piece.style,
            animationName: 'explode',
            animationTimingFunction: 'ease-out',
            animationFillMode: 'forwards',
          }}
        />
      ))}
      <style>{`
        @keyframes explode {
          0% {
            transform: translate(0, 0) scale(1);
            opacity: 1;
          }
          100% {
            transform: translate(var(--end-x), var(--end-y)) scale(0) rotate(var(--rotation));
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};

const WrongAnswerShake = ({ isActive }) => {
  if (!isActive) return null;

  return (
    <style>{`
      @keyframes shake {
        0%, 100% { transform: translateX(0); }
        10%, 30%, 50%, 70%, 90% { transform: translateX(-10px); }
        20%, 40%, 60%, 80% { transform: translateX(10px); }
      }
      @keyframes pulse-red {
        0%, 100% { background-color: rgba(255, 255, 255, 1); }
        50% { background-color: rgba(239, 68, 68, 0.1); }
      }
      .animate-shake {
        animation: shake 0.5s ease-in-out;
      }
      .animate-pulse-red {
        animation: pulse-red 0.6s ease-in-out;
      }
    `}</style>
  );
};

const QuestionModal = ({ currentClue, handleAnswer, feedback, onClose, timer, isPaused, onSkip, isChildPlayer }) => { // Added onSkip and isChildPlayer props
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = () => {
    setIsClosing(true);
  };

  if (!currentClue && !isClosing) {
    return null;
  }

  return (
    <>
      <Confetti isActive={feedback === 'correct'} />
      <WrongAnswerShake isActive={feedback === 'incorrect'} />
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
          <div className={`bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden transform transition-all scale-100 ${feedback === 'correct' ? 'ring-4 ring-green-400' : feedback === 'incorrect' ? 'animate-shake ring-4 ring-red-400' : ''}`}>
            <div className={`${feedback === 'correct' ? 'bg-gradient-to-r from-green-500 to-green-600' : feedback === 'incorrect' ? 'bg-gradient-to-r from-red-500 to-red-600 animate-pulse-red' : 'bg-indigo-700'} p-6 flex justify-between items-center transition-colors duration-300`}>
              <span className={`${feedback === 'correct' ? 'text-green-100' : feedback === 'incorrect' ? 'text-red-100' : 'text-indigo-200'} font-bold tracking-widest uppercase text-sm transition-colors duration-300`}>
                {feedback === 'correct' ? '🎉 Correct!' : feedback === 'incorrect' ? '❌ Incorrect' : `Difficulty Level ${currentClue.level}`}
              </span>
              <div className="flex items-center space-x-4">
                {isPaused ? (
                  <span className="font-black text-2xl text-yellow-400">Paused</span>
                ) : (
                  !isChildPlayer && (
                    <span className={`font-black text-2xl tabular-nums ${timer <= 5 ? 'text-red-400 animate-pulse' : feedback === 'correct' ? 'text-white' : 'text-white'}`}>
                      {timer}s
                    </span>
                  )
                )}
                <button onClick={handleClose} className={`${feedback === 'correct' ? 'hover:bg-green-500' : feedback === 'incorrect' ? 'hover:bg-red-500' : 'hover:bg-indigo-600'} text-white p-1 rounded-full transition-colors`}>
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
                      <div className="animate-bounce">
                        <Check className="w-24 h-24 mb-4 text-green-500" strokeWidth={1.5} />
                      </div>
                      <span className="text-4xl font-bold bg-gradient-to-r from-green-500 to-emerald-600 bg-clip-text text-transparent">Correct!</span>
                    </>
                  ) : (
                    <>
                      <div className="animate-bounce">
                        <X className="w-24 h-24 mb-4 text-red-500" strokeWidth={1.5} />
                      </div>
                      <div className="text-center">
                        <span className="text-4xl font-bold bg-gradient-to-r from-red-500 to-pink-600 bg-clip-text text-transparent">Incorrect</span>
                        <span className="text-slate-500 dark:text-gray-300 text-lg mt-4 block font-semibold">The correct answer was:</span>
                        <span className="text-xl font-bold text-green-600 dark:text-green-400 mt-2 block">{currentClue.answer}</span>
                      </div>
                    </>
                  )}
                  <button
                    onClick={handleClose}
                    className="mt-8 px-8 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                  >
                    Continue
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
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
                  {isChildPlayer && (
                    <button
                      onClick={() => {
                        if (onSkip) onSkip();
                        handleClose();
                      }}
                      disabled={isPaused}
                      className="w-full p-3 rounded-xl border-2 border-amber-300 dark:border-amber-600 bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 font-semibold transition-all flex items-center justify-center gap-2"
                      title="Skip this question without penalty"
                    >
                      <SkipForward className="w-5 h-5" />
                      Skip Question (No Penalty)
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default QuestionModal;
