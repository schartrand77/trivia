import React, { useState } from 'react'; // Added useState
import { Trophy, X, Search } from 'lucide-react'; // Added Search icon

const RecordsModal = ({ showRecords, setShowRecords, records }) => {
  const [searchTerm, setSearchTerm] = useState(''); // New state for search term

  if (!showRecords) return null;

  // Filtering logic
  const filteredRecords = records.filter(rec => {
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    return (
      rec.name.toLowerCase().includes(lowerCaseSearchTerm) ||
      rec.correct_answers.toString().includes(lowerCaseSearchTerm) ||
      rec.wrong_answers.toString().includes(lowerCaseSearchTerm) ||
      rec.date.toLowerCase().includes(lowerCaseSearchTerm) // Also search by date
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="bg-slate-800 text-white p-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Trophy className="w-5 h-5 text-yellow-400" />
            <h3 className="font-bold uppercase tracking-wide">Recent Records</h3>
          </div>
          <button onClick={() => setShowRecords(false)}><X className="w-5 h-5" /></button>
        </div>
        <div className="p-4"> {/* Added padding for search bar */}
          <div className="relative mb-4"> {/* Search bar container */}
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search records (player, correct, wrong, date)"
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="max-h-60 overflow-y-auto">
            {filteredRecords.length === 0 ? ( // Display filteredRecords
              <div className="p-8 text-center text-slate-400 dark:text-gray-300">No records found.</div>
            ) : (
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 dark:bg-gray-700 text-slate-500 dark:text-gray-200 font-semibold border-b dark:border-gray-600">
                  <tr>
                    <th className="p-3">Date</th>
                    <th className="p-3">Player</th>
                    <th className="p-3 text-right">✓ Correct</th>
                    <th className="p-3 text-right">✗ Wrong</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRecords.map((rec, index) => ( // Display filteredRecords
                    <tr key={index} className="border-b dark:border-gray-700 last:border-0 hover:bg-slate-50 dark:hover:bg-gray-700">
                      <td className="p-3 text-slate-500 dark:text-gray-300">{rec.date}</td>
                      <td className="p-3 font-medium text-slate-800 dark:text-gray-100">{rec.name}</td>
                      <td className="p-3 text-right font-bold text-green-600">{rec.correct_answers}</td>
                      <td className="p-3 text-right font-bold text-red-600">{rec.wrong_answers}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div> {/* Changed p-0 to p-4, moved bottom div */}
        <div className="p-3 bg-slate-50 dark:bg-gray-700 border-t dark:border-gray-600 text-xs text-center text-slate-400 dark:text-gray-300">
          Records stored in the database
        </div>
      </div>
    </div>
  );
};

export default RecordsModal;
