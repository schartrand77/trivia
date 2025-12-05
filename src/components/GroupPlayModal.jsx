import React, { useState, useEffect } from 'react';
import { Users, Plus, X, Shuffle, Play } from 'lucide-react';

const GroupPlayModal = ({ show, players, onClose, onStartGroupPlay, onAddNewPlayer }) => {
  const [selectedPlayers, setSelectedPlayers] = useState([]);
  const [newPlayerName, setNewPlayerName] = useState('');
  const [newPlayerAge, setNewPlayerAge] = useState('');
  const [isAddingPlayer, setIsAddingPlayer] = useState(false);
  const [playOrder, setPlayOrder] = useState([]);
  const [orderShuffled, setOrderShuffled] = useState(false);

  const togglePlayerSelection = (player) => {
    setSelectedPlayers(prev => {
      const isSelected = prev.some(p => p.id === player.id);
      if (isSelected) {
        return prev.filter(p => p.id !== player.id);
      } else {
        return [...prev, player];
      }
    });
  };

  const shufflePlayOrder = () => {
    if (selectedPlayers.length === 0) return;
    const shuffled = [...selectedPlayers].sort(() => Math.random() - 0.5);
    setPlayOrder(shuffled);
    setOrderShuffled(true);
  };

  const handleAddPlayer = () => {
    if (newPlayerName.trim() === '') return;
    const age = newPlayerAge.trim() ? parseInt(newPlayerAge, 10) : null;
    onAddNewPlayer(newPlayerName.trim(), age);
    setNewPlayerName('');
    setNewPlayerAge('');
    setIsAddingPlayer(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleAddPlayer();
    }
  };

  const handleStartGame = () => {
    if (playOrder.length === 0) {
      alert('Please select and shuffle players first!');
      return;
    }
    onStartGroupPlay(playOrder);
  };

  if (!show) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-indigo-600 text-white p-6 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Users className="w-6 h-6" />
            <h3 className="font-bold text-lg uppercase tracking-wide">Group Play Setup</h3>
          </div>
          <button onClick={onClose} className="hover:bg-indigo-700 p-2 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Step 1: Select Players */}
          <div>
            <h4 className="font-bold text-slate-800 dark:text-gray-100 mb-3 text-sm uppercase">
              Step 1: Select Players
            </h4>
            
            {/* Add New Player Form */}
            {isAddingPlayer ? (
              <div className="bg-indigo-50 dark:bg-indigo-900/30 p-4 rounded-lg mb-4 space-y-3">
                <label className="block text-sm font-medium text-slate-700 dark:text-gray-300">
                  Enter new player name:
                </label>
                <input
                  type="text"
                  value={newPlayerName}
                  onChange={(e) => setNewPlayerName(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Player name"
                  autoFocus
                  className="w-full px-3 py-2 border-2 border-indigo-300 dark:border-indigo-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-gray-100"
                />
                <label className="block text-sm font-medium text-slate-700 dark:text-gray-300">
                  Age (optional - enables family mode):
                </label>
                <input
                  type="number"
                  value={newPlayerAge}
                  onChange={(e) => setNewPlayerAge(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Age"
                  min="1"
                  max="120"
                  className="w-full px-3 py-2 border-2 border-indigo-300 dark:border-indigo-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-gray-100"
                />
                <p className="text-xs text-slate-500 dark:text-gray-400">
                  📌 Setting an age will automatically adjust question difficulty to be age-appropriate
                </p>
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
                className="w-full py-2 border-2 border-indigo-600 dark:border-indigo-500 text-indigo-600 dark:text-indigo-400 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900 transition-colors font-medium flex items-center justify-center space-x-2 mb-4"
              >
                <Plus className="w-5 h-5" />
                <span>Create New Player</span>
              </button>
            )}

            {/* Player Selection List */}
            <div className="space-y-2 max-h-64 overflow-y-auto border dark:border-gray-700 rounded-lg p-3 bg-slate-50 dark:bg-gray-700/50">
              {players.length > 0 ? (
                players.map((player) => (
                  <label
                    key={player.id}
                    className="flex items-center p-3 rounded-lg border-2 border-slate-200 dark:border-gray-600 hover:bg-indigo-50 dark:hover:bg-gray-600 cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={selectedPlayers.some(p => p.id === player.id)}
                      onChange={() => togglePlayerSelection(player)}
                      className="w-4 h-4 accent-indigo-600"
                    />
                    <span className="ml-3 font-medium text-slate-800 dark:text-gray-100">
                      {player.name}
                    </span>
                  </label>
                ))
              ) : (
                <p className="text-center text-slate-500 dark:text-gray-400 py-4">
                  No players yet. Create one to get started!
                </p>
              )}
            </div>
            
            {selectedPlayers.length > 0 && (
              <p className="text-sm text-indigo-600 dark:text-indigo-400 mt-2 font-medium">
                {selectedPlayers.length} player{selectedPlayers.length !== 1 ? 's' : ''} selected
              </p>
            )}
          </div>

          {/* Step 2: Shuffle Order */}
          {selectedPlayers.length > 0 && (
            <div>
              <h4 className="font-bold text-slate-800 dark:text-gray-100 mb-3 text-sm uppercase">
                Step 2: Randomize Play Order
              </h4>
              <button
                onClick={shufflePlayOrder}
                className="w-full py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-bold flex items-center justify-center space-x-2 text-lg"
              >
                <Shuffle className="w-5 h-5" />
                <span>Shuffle Play Order</span>
              </button>
            </div>
          )}

          {/* Step 3: Display Play Order */}
          {orderShuffled && playOrder.length > 0 && (
            <div>
              <h4 className="font-bold text-slate-800 dark:text-gray-100 mb-3 text-sm uppercase">
                Step 3: Play Order
              </h4>
              <div className="space-y-2">
                {playOrder.map((player, index) => (
                  <div
                    key={player.id}
                    className={`p-4 rounded-lg font-bold text-white flex items-center space-x-3 ${
                      index === 0
                        ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 scale-105 shadow-lg'
                        : 'bg-slate-400 dark:bg-slate-600'
                    }`}
                  >
                    <span className="text-2xl w-8 text-center">#{index + 1}</span>
                    <span className="text-lg">{player.name}</span>
                    {index === 0 && <span className="ml-auto text-xl">FIRST PLAYER</span>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {orderShuffled && playOrder.length > 0 && (
          <div className="border-t dark:border-gray-700 p-4 bg-slate-50 dark:bg-gray-700 flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 bg-slate-300 dark:bg-gray-600 text-slate-800 dark:text-gray-100 rounded-lg hover:bg-slate-400 dark:hover:bg-gray-500 transition-colors font-bold"
            >
              Cancel
            </button>
            <button
              onClick={handleStartGame}
              className="flex-1 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-bold flex items-center justify-center space-x-2"
            >
              <Play className="w-5 h-5" />
              <span>Start Game</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default GroupPlayModal;
