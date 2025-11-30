import React from 'react';
import { X, HelpCircle } from 'lucide-react';

const HowToPlayModal = ({ show, onClose }) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="bg-slate-800 text-white p-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <HelpCircle className="w-5 h-5 text-yellow-400" />
            <h3 className="font-bold uppercase tracking-wide">How to Play</h3>
          </div>
          <button onClick={onClose}><X className="w-5 h-5" /></button>
        </div>
        <div className="p-4 max-h-80 overflow-y-auto text-slate-700 dark:text-gray-100">
          <h4 className="font-semibold text-lg mb-2">Objective:</h4>
          <p className="mb-4">Answer trivia questions correctly to earn points. The player with the highest score wins!</p>

          <h4 className="font-semibold text-lg mb-2">Game Board:</h4>
          <ul className="list-disc list-inside mb-4">
            <li>The board consists of multiple categories (columns) and difficulty levels (rows).</li>
            <li>Each cell represents a trivia question with a specific point value.</li>
            <li>Questions are sorted by difficulty: easier questions have lower point values, harder questions have higher point values.</li>
          </ul>

          <h4 className="font-semibold text-lg mb-2">Playing a Turn:</h4>
          <ul className="list-disc list-inside mb-4">
            <li>Click on any unanswered question cell to open the question modal.</li>
            <li>Read the question and select one of the provided options.</li>
            <li>Correct answers add the question's point value to your score.</li>
            <li>Incorrect answers deduct the question's point value from your score.</li>
          </ul>

          <h4 className="font-semibold text-lg mb-2">Game End:</h4>
          <p className="mb-4">The game ends when all questions have been answered. Your final score will be recorded (if saved).</p>

          <h4 className="font-semibold text-lg mb-2">Features:</h4>
          <ul className="list-disc list-inside mb-4">
            <li><strong>Player Management:</strong> Add, edit, or delete players.</li>
            <li><strong>Category Selection:</strong> Choose the number of categories or select specific categories to play with.</li>
            <li><strong>Game History:</strong> View your past scores in the records modal.</li>
            <li><strong>Dark Mode:</strong> Toggle between light and dark themes.</li>
            <li><strong>Unsaved Progress Warning:</strong> Get a warning before starting a new game if you have unsaved progress.</li>
          </ul>
        </div>
        <div className="p-3 bg-slate-50 dark:bg-gray-700 border-t dark:border-gray-600 text-xs text-center text-slate-400 dark:text-gray-300">
          Have fun playing Trivia Master!
        </div>
      </div>
    </div>
  );
};

export default HowToPlayModal;