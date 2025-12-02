import React, { useContext } from 'react'; // Added useContext
import { User, Shuffle, Database, RefreshCw, UserPlus, Sun, Moon, Info, Play, Pause, LogOut, Users, Zap, HelpCircle } from 'lucide-react'; // Added Users icon
import { ThemeContext } from '../App'; // Import ThemeContext

const Header = ({
  playerName,
  setPlayerName,
  randomizePlayer,
  score, // Keep score for calculation but don't display
  correctAnswers,
  wrongAnswers,
  currentScore, // New prop for confirmation logic
  setShowRecords,
  setShowPlayers,
  setShowPlayerSelector, // New prop for player selector modal
  setShowGroupPlay, // New prop for group play modal
  saveRecord,
  startNewGame,
  categoryCount,
  setCategoryCount,
  players, // Added players prop
  setShowCategoriesModal, // Added setShowCategoriesModal prop
  setShowHowToPlayModal, // Added setShowHowToPlayModal prop
  setShowAboutModal, // Added setShowAboutModal prop
  difficulty,
  setDifficulty,
  isPaused,
  onPauseGame,
  onResumeGame,
  onEndGame, // New prop for ending the game
}) => {
  const { isDarkMode, toggleDarkMode } = useContext(ThemeContext); // Use theme context

  return (
    <header className="bg-indigo-700 text-white shadow-lg sticky top-0 z-20">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center h-16">
          <img src="/banner.png" alt="Stores Huddle Trivia" className="h-full object-contain" />
        </div>
        
        <div className="flex items-center space-x-2 md:space-x-4 flex-wrap justify-end">
          
          {/* Player Selector */}
          <div className="flex items-center bg-indigo-800 rounded-full px-2 py-1 space-x-1 border border-indigo-600">
            <User className="w-3 h-3 text-indigo-300" />
            <select
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              className="bg-transparent border-none text-white text-xs focus:ring-0 pr-3" // Added pr-6 for dropdown arrow
            >
              {players.length > 0 ? (
                players.map((player) => (
                  <option key={player.id} value={player.name} className="bg-indigo-700">
                    {player.name}
                  </option>
                ))
              ) : (
                <option value="Player 1" className="bg-indigo-700">Player 1</option>
              )}
            </select>
            <button onClick={() => setShowPlayerSelector(true)} title="Switch Player" className="p-1">
              <User className="w-3 h-3 text-yellow-400 hover:text-yellow-300 transition-colors" />
            </button>
            <button onClick={randomizePlayer} title="Random Player" className="p-1">
              <Shuffle className="w-3 h-3 text-yellow-400 hover:rotate-180 transition-transform" />
            </button>
          </div>

          {/* Category Count Selector */}
          <div className="flex items-center bg-indigo-800 rounded-full px-2 py-1 space-x-1 border border-indigo-600">
            <span className="text-indigo-300 text-xs">Categories:</span>
            <select
              value={categoryCount}
              onChange={(e) => setCategoryCount(Number(e.target.value))}
              className="bg-transparent border-none text-white text-xs focus:ring-0"
            >
              {[...Array(8).keys()].map(i => (
                <option key={i + 3} value={i + 3} className="bg-indigo-700">{i + 3}</option>
              ))}
            </select>
            <button
              onClick={() => setShowCategoriesModal(true)}
              className="p-1 hover:bg-indigo-600 rounded-full transition-colors"
              title="Choose Specific Categories"
            >
              <Zap className="w-4 h-4 text-yellow-400" />
            </button>
          </div>

          {/* Difficulty Selector */}
          <div className="flex items-center bg-indigo-800 rounded-full px-2 py-1 space-x-1 border border-indigo-600">
            <span className="text-indigo-300 text-xs">Difficulty:</span>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="bg-transparent border-none text-white text-xs focus:ring-0"
            >
              <option value="any" className="bg-indigo-700">Any</option>
              <option value="easy" className="bg-indigo-700">Easy</option>
              <option value="medium" className="bg-indigo-700">Medium</option>
              <option value="hard" className="bg-indigo-700">Hard</option>
            </select>
          </div>

          {/* Score */}
          <div className="flex flex-col items-end min-w-[80px]">
            <span className="text-[10px] text-indigo-200 uppercase font-semibold">Correct / Wrong</span>
            <span className="text-sm font-bold leading-none tabular-nums">
              <span className="text-green-300">{correctAnswers}</span>
              <span className="text-gray-300"> / </span>
              <span className="text-red-300">{wrongAnswers}</span>
            </span>
          </div>

          {/* Controls */}
          <div className="flex space-x-1">
            <button
              onClick={() => setShowHowToPlayModal(true)} // New button for How to Play
              className="p-2 hover:bg-indigo-600 rounded-full transition-colors"
              title="How to Play"
            >
              <HelpCircle className="w-5 h-5" />
            </button>
            <button
              onClick={() => setShowPlayers(true)}
              className="p-2 hover:bg-indigo-600 rounded-full transition-colors"
              title="Manage Players"
            >
              <UserPlus className="w-5 h-5" />
            </button>
            <button
              onClick={() => setShowGroupPlay(true)}
              className="p-2 hover:bg-indigo-600 rounded-full transition-colors"
              title="Group Play - Select & Randomize Players"
            >
              <Users className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setShowRecords(true)}
              className="p-2 hover:bg-indigo-600 rounded-full transition-colors"
              title="History / Records"
            >
              <Database className="w-5 h-5" />
            </button>
            <button 
              onClick={() => { saveRecord(); startNewGame(); }}
              className="p-2 hover:bg-indigo-600 rounded-full transition-colors"
              title="Restart Game"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
            <button 
              onClick={onEndGame}
              className="p-2 hover:bg-red-600 rounded-full transition-colors"
              title="End Game"
            >
              <LogOut className="w-5 h-5" />
            </button>
            {/* Pause/Play Button */}
            {isPaused ? (
              <button
                onClick={onResumeGame}
                className="p-2 hover:bg-indigo-600 rounded-full transition-colors"
                title="Resume Game"
              >
                <Play className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={onPauseGame}
                className="p-2 hover:bg-indigo-600 rounded-full transition-colors"
                title="Pause Game"
              >
                <Pause className="w-5 h-5" />
              </button>
            )}
            <button
              onClick={toggleDarkMode}
              className="p-2 hover:bg-indigo-600 rounded-full transition-colors"
              title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button
              onClick={() => setShowAboutModal(true)}
              className="p-2 hover:bg-indigo-600 rounded-full transition-colors"
              title="About"
            >
              <Info className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
