import React, { useState } from 'react';
import { UserPlus, X, Edit, Trash, Save, XCircle } from 'lucide-react'; // Added Save and XCircle

const PlayersModal = ({ show, onClose, players, onAddPlayer, onUpdatePlayer, onDeletePlayer }) => {
  const [newPlayerName, setNewPlayerName] = useState('');
  const [editingPlayerId, setEditingPlayerId] = useState(null);
  const [editedPlayerName, setEditedPlayerName] = useState('');

  const handleAddPlayer = () => {
    if (newPlayerName.trim() === '') return;
    onAddPlayer(newPlayerName.trim());
    setNewPlayerName('');
  };

  const handleEditClick = (player) => {
    setEditingPlayerId(player.id);
    setEditedPlayerName(player.name);
  };

  const handleSaveEdit = (id) => {
    if (editedPlayerName.trim() === '') return;
    onUpdatePlayer(id, editedPlayerName.trim());
    setEditingPlayerId(null);
    setEditedPlayerName('');
  };

  const handleCancelEdit = () => {
    setEditingPlayerId(null);
    setEditedPlayerName('');
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
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={newPlayerName}
              onChange={(e) => setNewPlayerName(e.target.value)}
              placeholder="Enter new player name"
              className="flex-grow p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
            />
            <button
              onClick={handleAddPlayer}
              className="p-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
            >
              Add Player
            </button>
          </div>
          <div className="max-h-60 overflow-y-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-gray-700 text-slate-500 dark:text-gray-200 font-semibold border-b dark:border-gray-600">
                <tr>
                  <th className="p-3">ID</th>
                  <th className="p-3">Name</th>
                  <th className="p-3 text-right">Actions</th> {/* Added Actions column */}
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
