import React, { useMemo, useState } from 'react';
import { Check, X } from 'lucide-react';

const Confetti = ({ isActive }) => {
  const pieces = useMemo(() => (
    Array.from({ length: 120 }, (_, i) => ({
      id: i,
      tx: (Math.random() * 160 - 80).toFixed(1),
      ty: (Math.random() * 120 - 60).toFixed(1),
      delay: Math.random() * 0.7,
      duration: 1.2 + Math.random() * 0.6,
      size: 4 + Math.random() * 6,
      color: ['#fcd34d', '#f472b6', '#60a5fa', '#34d399', '#c084fc'][Math.floor(Math.random() * 5)],
      rotation: Math.floor(Math.random() * 360),
    }))
  ), []);

  if (!isActive) return null;

  return (
    <div className="confetti-explosion">
      {pieces.map(piece => (
        <span
          key={piece.id}
          className="confetti-piece"
          style={{
            '--tx': `${piece.tx}vw`,
            '--ty': `${piece.ty}vh`,
            '--rotate-start': `${piece.rotation}deg`,
            width: `${piece.size}px`,
            height: `${piece.size * 2}px`,
            backgroundColor: piece.color,
            animationDelay: `${piece.delay}s`,
            animationDuration: `${piece.duration}s`,
          }}
        />
      ))}
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

const QuestionModal = ({ currentClue, handleAnswer, feedback, onClose, timer, isPaused }) => { // Added timer prop, isPaused
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
                {feedback === 'correct' ? 'Correct!' : feedback === 'incorrect' ? 'Incorrect' : `Difficulty Level ${currentClue.level}`}
              </span>
              <div className="flex items-center space-x-4">
                {isPaused ? (
                  <span className="font-black text-2xl text-yellow-400">Paused</span>
                ) : (
                  <span className={`font-black text-2xl tabular-nums ${timer <= 5 ? 'text-red-400 animate-pulse' : feedback === 'correct' ? 'text-white' : 'text-white'}`}>
                    {timer}s
                  </span>
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
    </>
  );
};

export default QuestionModal;
