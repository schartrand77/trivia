import React from 'react';
import { X, Info } from 'lucide-react';

const AboutModal = ({ show, onClose }) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="bg-slate-800 text-white p-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Info className="w-5 h-5 text-yellow-400" />
            <h3 className="font-bold uppercase tracking-wide">About Trivia Master</h3>
          </div>
          <button onClick={onClose}><X className="w-5 h-5" /></button>
        </div>
        <div className="p-4 max-h-80 overflow-y-auto text-slate-700 dark:text-gray-100">
          <h4 className="font-semibold text-lg mb-2">Purpose:</h4>
          <p className="mb-4">Trivia Master is a fun and engaging trivia game designed to test your knowledge across various categories. Challenge yourself and see how well you score!</p>

          <h4 className="font-semibold text-lg mb-2">Technologies Used:</h4>
          <ul className="list-disc list-inside mb-4">
            <li><strong>Frontend:</strong> React.js (with Vite for fast development)</li>
            <li><strong>Styling:</strong> Tailwind CSS</li>
            <li><strong>Icons:</strong> Lucide React</li>
            <li><strong>State Management:</strong> React's `useReducer` hook</li>
            <li><strong>Database:</strong> `sql.js` (SQLite compiled to WebAssembly for in-browser data storage)</li>
            <li><strong>API:</strong> Open Trivia Database (opentdb.com)</li>
          </ul>

          <h4 className="font-semibold text-lg mb-2">Credits:</h4>
          <p className="mb-4">
            Developed by Stephen Chartrand.
            Questions provided by the <a href="https://opentdb.com/" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Open Trivia Database</a>.
            Icons from <a href="https://lucide.dev/" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Lucide React</a>.
          </p>
        </div>
        <div className="p-3 bg-slate-50 dark:bg-gray-700 border-t dark:border-gray-600 text-xs text-center text-slate-400 dark:text-gray-300">
          Version 1.0.0
        </div>
      </div>
    </div>
  );
};

export default AboutModal;