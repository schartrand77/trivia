import React, { useState } from 'react';
import { UserPlus, X, Edit, Trash, Save, XCircle } from 'lucide-react'; // Added Save and XCircle

const PlayersModal = ({ show, onClose, players, onAddPlayer, onUpdatePlayer, onDeletePlayer }) => {
  const [newPlayerName, setNewPlayerName] = useState('');
  const [newPlayerAge, setNewPlayerAge] = useState('');
  const [editingPlayerId, setEditingPlayerId] = useState(null);
  const [editedPlayerName, setEditedPlayerName] = useState('');
  const [editedPlayerAge, setEditedPlayerAge] = useState('');

  const handleAddPlayer = () => {
    if (newPlayerName.trim() === '') return;
    const age = newPlayerAge.trim() ? parseInt(newPlayerAge, 10) : null;
    onAddPlayer(newPlayerName.trim(), age);
    setNewPlayerName('');
    setNewPlayerAge('');
  };

  const handleEditClick = (player) => {
    setEditingPlayerId(player.id);
    setEditedPlayerName(player.name);
    setEditedPlayerAge(player.age ? player.age.toString() : '');
  };

  const handleSaveEdit = (id) => {
    if (editedPlayerName.trim() === '') return;
    const age = editedPlayerAge.trim() ? parseInt(editedPlayerAge, 10) : null;
    onUpdatePlayer(id, editedPlayerName.trim(), age);
    setEditingPlayerId(null);
    setEditedPlayerName('');
    setEditedPlayerAge('');
  };

  const handleCancelEdit = () => {
    setEditingPlayerId(null);
    setEditedPlayerName('');
    setEditedPlayerAge('');
  };

  const handleDeleteClick = (id) => {
    if (window.confirm('Are you sure you want to delete this player and all their game history?')) {
      onDeletePlayer(id);
    }
  };

  if (!show) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="bg-slate-800 text-white p-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <UserPlus className="w-5 h-5 text-yellow-400" />
            <h3 className="font-bold uppercase tracking-wide">Manage Players</h3>
          </div>
          <button onClick={onClose}><X className="w-5 h-5" /></button>
        </div>
        <div className="p-4">
          <div className="flex flex-col gap-2 mb-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={newPlayerName}
                onChange={(e) => setNewPlayerName(e.target.value)}
                placeholder="Enter player name"
                className="flex-grow p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
              />
              <input
                type="number"
                value={newPlayerAge}
                onChange={(e) => setNewPlayerAge(e.target.value)}
                placeholder="Age"
                min="1"
                max="120"
                className="w-16 p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
              />
              <button
                onClick={handleAddPlayer}
                className="px-3 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 whitespace-nowrap"
              >
                Add Player
              </button>
            </div>
            <p className="text-xs text-slate-500 dark:text-gray-400">📌 Age field enables family mode - questions will be age-appropriate</p>
          </div>
          <div className="max-h-60 overflow-y-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-gray-700 text-slate-500 dark:text-gray-200 font-semibold border-b dark:border-gray-600">
                <tr>
                  <th className="p-3">ID</th>
                  <th className="p-3">Name</th>
                  <th className="p-3">Age</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {players.map((player) => (
                  <tr key={player.id} className="border-b dark:border-gray-700 last:border-0 hover:bg-slate-50 dark:hover:bg-gray-700">
                    <td className="p-3 text-slate-500 dark:text-gray-300">{player.id}</td>
                    <td className="p-3 font-medium text-slate-800 dark:text-gray-100">
                      {editingPlayerId === player.id ? (
                        <input
                          type="text"
                          value={editedPlayerName}
                          onChange={(e) => setEditedPlayerName(e.target.value)}
                          className="w-full p-1 border rounded text-slate-800 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                        />
                      ) : (
                        player.name
                      )}
                    </td>
                    <td className="p-3 text-slate-800 dark:text-gray-100">
                      {editingPlayerId === player.id ? (
                        <input
                          type="number"
                          value={editedPlayerAge}
                          onChange={(e) => setEditedPlayerAge(e.target.value)}
                          min="1"
                          max="120"
                          className="w-14 p-1 border rounded text-slate-800 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                        />
                      ) : (
                        player.age ? `${player.age} yrs` : '—'
                      )}
                    </td>
                    <td className="p-3 text-right">
                      {editingPlayerId === player.id ? (
                        <div className="flex justify-end gap-2">
                          <button onClick={() => handleSaveEdit(player.id)} className="p-1 text-green-600 hover:text-green-800" title="Save">
                            <Save className="w-5 h-5" />
                          </button>
                          <button onClick={handleCancelEdit} className="p-1 text-red-600 hover:text-red-800" title="Cancel">
                            <XCircle className="w-5 h-5" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex justify-end gap-2">
                          <button onClick={() => handleEditClick(player)} className="p-1 text-blue-600 hover:text-blue-800" title="Edit">
                            <Edit className="w-5 h-5" />
                          </button>
                          <button onClick={() => handleDeleteClick(player.id)} className="p-1 text-red-600 hover:text-red-800" title="Delete">
                            <Trash className="w-5 h-5" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayersModal;
