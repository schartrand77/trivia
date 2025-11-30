import React from 'react';
import { X, Trophy } from 'lucide-react';

const GameOverModal = ({ show, finalScore, onPlayAgain }) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md overflow-hidden text-center">
        <div className="bg-slate-800 text-white p-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Trophy className="w-5 h-5 text-yellow-400" />
            <h3 className="font-bold uppercase tracking-wide">Game Over!</h3>
          </div>
          {/* No explicit close button, only Play Again */}
        </div>
        <div className="p-8">
          <p className="text-xl text-slate-700 dark:text-gray-100 mb-4">Your final score is:</p>
          <p className="text-5xl font-black text-indigo-600 dark:text-indigo-400 mb-8">{finalScore}</p>
          <button
            onClick={onPlayAgain}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-lg font-semibold"
          >
            Play Again!
          </button>
        </div>
        <div className="p-3 bg-slate-50 dark:bg-gray-700 border-t dark:border-gray-600 text-xs text-center text-slate-400 dark:text-gray-300">
          Thanks for playing!
        </div>
      </div>
    </div>
  );
};

export default GameOverModal;
