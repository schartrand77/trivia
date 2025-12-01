import React, { useState } from 'react';
import { User, UserPlus, X } from 'lucide-react';

const PlayerSelectorModal = ({ show, players, onSelectPlayer, onAddNewPlayer }) => {
  const [newPlayerName, setNewPlayerName] = useState('');
  const [isAddingPlayer, setIsAddingPlayer] = useState(false);

  const handleAddPlayer = () => {
    if (newPlayerName.trim() === '') return;
    onAddNewPlayer(newPlayerName.trim());
    setNewPlayerName('');
    setIsAddingPlayer(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleAddPlayer();
    }
  };

  if (!show) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="bg-indigo-600 text-white p-6 flex items-center space-x-3">
          <User className="w-6 h-6" />
          <h3 className="font-bold text-lg uppercase tracking-wide">Select Player</h3>
        </div>
        
        <div className="p-6">
          {/* Player List */}
          {players.length > 0 && !isAddingPlayer && (
            <>
              <p className="text-sm text-slate-600 dark:text-gray-400 mb-4">Choose a player to start:</p>
              <div className="space-y-2 mb-4 max-h-64 overflow-y-auto">
                {players.map((player) => (
                  <button
                    key={player.id}
                    onClick={() => onSelectPlayer(player.name)}
                    className="w-full text-left p-3 rounded-lg border-2 border-indigo-200 dark:border-indigo-700 hover:bg-indigo-50 dark:hover:bg-indigo-900 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <User className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                      <span className="font-medium text-slate-800 dark:text-gray-100">{player.name}</span>
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}

          {/* Add New Player Form */}
          {isAddingPlayer ? (
            <div className="space-y-3">
              <label className="block text-sm font-medium text-slate-700 dark:text-gray-300">
                Enter new player name:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newPlayerName}
                  onChange={(e) => setNewPlayerName(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Player name"
                  autoFocus
                  className="flex-grow px-3 py-2 border-2 border-indigo-300 dark:border-indigo-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-gray-100"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleAddPlayer}
                  className="flex-1 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                >
                  Create Player
                </button>
                <button
                  onClick={() => {
                    setIsAddingPlayer(false);
                    setNewPlayerName('');
                  }}
                  className="flex-1 py-2 bg-slate-300 dark:bg-gray-600 text-slate-800 dark:text-gray-100 rounded-lg hover:bg-slate-400 dark:hover:bg-gray-500 transition-colors font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setIsAddingPlayer(true)}
              className="w-full py-2 border-2 border-indigo-600 dark:border-indigo-500 text-indigo-600 dark:text-indigo-400 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900 transition-colors font-medium flex items-center justify-center space-x-2"
            >
              <UserPlus className="w-5 h-5" />
              <span>Create New Player</span>
            </button>
          )}
        </div>

        {/* Footer Info */}
        {!isAddingPlayer && players.length > 0 && (
          <div className="px-6 pb-4 text-xs text-slate-500 dark:text-gray-400 text-center">
            Select a player or create a new one to begin
          </div>
        )}
      </div>
    </div>
  );
};

export default PlayerSelectorModal;
