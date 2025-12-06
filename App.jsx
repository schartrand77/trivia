import React, { useState, useEffect } from 'react';
import { HelpCircle, Check, X, Trophy, RefreshCw, Database, User, Shuffle, Loader, Lock, LogOut } from 'lucide-react';

// --- CONSTANTS ---
const CATEGORY_IDS = [
  9,  // General Knowledge
  10, // Books
  11, // Film
  12, // Music
  17, // Nature
  18, // Computers
  21, // Sports
  22, // Geography
  23, // History
  27, // Animals
  28, // Vehicles
];

const RANDOM_NAMES = [
  "Quiz Whiz", "Trivia Titan", "Brainiac", "Fact Finder", "Smarty Pants", 
  "The Professor", "Logic Lord", "Mind Master", "Guess Guru", "Knowledge Knight", 
  "Data Duke", "Puzzle Pro", "Memory Maven", "The Sage", "The Oracle"
];

const CATEGORY_COUNT = 5; // Updated from 4 to 5

const getRuntimeConfig = () => {
  if (typeof window !== 'undefined' && window.__TRIVIA_CONFIG__) {
    return window.__TRIVIA_CONFIG__;
  }
  return {};
};

const runtimeConfig = getRuntimeConfig();
const ADMIN_USERNAME = (runtimeConfig.VITE_ADMIN_USERNAME ?? import.meta.env.VITE_ADMIN_USERNAME ?? 'admin').trim();
const ADMIN_PASSWORD = runtimeConfig.VITE_ADMIN_PASSWORD ?? import.meta.env.VITE_ADMIN_PASSWORD ?? 'trivia';

// --- HELPER: HTML DECODER ---
const decodeHTML = (html) => {
  const txt = document.createElement('textarea');
  txt.innerHTML = html;
  return txt.value;
};

// --- HELPER: DELAY ---
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export default function App() {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [loginError, setLoginError] = useState('');

  // Game State
  const [gameData, setGameData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMessage, setLoadingMessage] = useState("Initializing...");
  const [score, setScore] = useState(0);
  const [answeredIds, setAnsweredIds] = useState(new Set());
  const [currentClue, setCurrentClue] = useState(null);
  const [feedback, setFeedback] = useState(null);
  
  // User & Records State
  const [playerName, setPlayerName] = useState("Player 1");
  const [showRecords, setShowRecords] = useState(false);
  const [records, setRecords] = useState([]);

  // --- INITIALIZATION ---
  
  useEffect(() => {
    if (!isAuthenticated) return;
    startNewGame();
    loadRecords();
  }, [isAuthenticated]);

  // --- AUTH LOGIC ---

  const handleLogin = () => {
    setLoginError('');

    const username = credentials.username.trim();
    const password = credentials.password;

    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      setCredentials({ username: '', password: '' });
      return;
    }

    setLoginError('Invalid username or password');
  };

  const handleCredentialsKeyDown = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleLogin();
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setGameData([]);
    setScore(0);
    setAnsweredIds(new Set());
    setCurrentClue(null);
    setFeedback(null);
    setRecords([]);
    setShowRecords(false);
  };

  // --- API & DATA LOGIC ---

  const startNewGame = async () => {
    setLoading(true);
    setScore(0);
    setAnsweredIds(new Set());
    setFeedback(null);
    setCurrentClue(null);
    setGameData([]);

    // 1. Pick random unique categories
    const shuffledCats = [...CATEGORY_IDS].sort(() => 0.5 - Math.random());
    const selectedCatIds = shuffledCats.slice(0, CATEGORY_COUNT);
    
    const newGameData = [];

    // 2. Fetch questions sequentially to avoid Rate Limiting (Code 429/5)
    try {
      for (let i = 0; i < selectedCatIds.length; i++) {
        const catId = selectedCatIds[i];
        setLoadingMessage(`Fetching Category ${i + 1} of ${CATEGORY_COUNT}...`);

        // Add a small delay between requests to be polite to the API
        if (i > 0) await wait(1200); 

        try {
          const res = await fetch(`https://opentdb.com/api.php?amount=5&category=${catId}&type=multiple`);
          const data = await res.json();

          // Check for API errors or empty results
          if (!data.results || data.results.length === 0) {
            console.warn(`Category ${catId} failed or has no data. Skipping.`);
            continue;
          }

          // Sort by difficulty (easy -> hard) to simulate level progression
          const difficultyMap = { easy: 1, medium: 2, hard: 3 };
          const sortedQuestions = data.results.sort((a, b) => difficultyMap[a.difficulty] - difficultyMap[b.difficulty]);

          newGameData.push({
            category: data.results[0].category.replace("Entertainment: ", "").replace("Science: ", ""),
            clues: sortedQuestions.map((q, index) => ({
              id: `${catId}-${index}-${Math.random().toString(36).substr(2, 9)}`,
              level: index + 1, // Number 1-5 instead of $
              value: (index + 1) * 10, // Internal score value
              question: decodeHTML(q.question),
              answer: decodeHTML(q.correct_answer),
              options: [...q.incorrect_answers, q.correct_answer]
                .map(decodeHTML)
                .sort(() => Math.random() - 0.5) // Shuffle options
            }))
          });
        } catch (innerError) {
          console.warn(`Failed to fetch category ${catId}`, innerError);
        }
      }

      if (newGameData.length === 0) {
        setLoadingMessage("Failed to load questions. Please try again.");
        return;
      }

      setGameData(newGameData);
    } catch (error) {
      console.error("Critical error fetching questions:", error);
      setLoadingMessage("Error connecting to Trivia API.");
    } finally {
      setLoading(false);
    }
  };

  // --- RECORDS (SQLite Simulation using localStorage) ---
  
  const loadRecords = () => {
    try {
      const saved = localStorage.getItem('trivia_records');
      if (saved) setRecords(JSON.parse(saved));
    } catch (e) {
      console.error("Failed to load records", e);
    }
  };

  const saveRecord = () => {
    // Only save if score is non-zero to avoid spam
    if (score === 0) return; 

    const newRecord = {
      id: Date.now(),
      name: playerName,
      score: score,
      date: new Date().toLocaleDateString()
    };
    
    const updatedRecords = [newRecord, ...records].slice(0, 10); // Keep top 10 recent
    setRecords(updatedRecords);
    localStorage.setItem('trivia_records', JSON.stringify(updatedRecords));
  };

  // --- ACTIONS ---

  const randomizeName = () => {
    const randomName = RANDOM_NAMES[Math.floor(Math.random() * RANDOM_NAMES.length)];
    setPlayerName(randomName);
  };

  const handleClueClick = (clue) => {
    if (answeredIds.has(clue.id)) return;
    setCurrentClue(clue);
    setFeedback(null);
  };

  const handleAnswer = (selectedOption) => {
    if (!currentClue) return;

    const isCorrect = selectedOption === currentClue.answer;
    
    if (isCorrect) {
      setScore((prev) => prev + currentClue.value);
      setFeedback('correct');
    } else {
      setScore((prev) => prev - currentClue.value); // Optional penalty
      setFeedback('incorrect');
    }

    setAnsweredIds((prev) => {
      const newSet = new Set(prev).add(currentClue.id);
      // Check if game is over (all questions answered)
      const totalQuestions = gameData.length * 5;
      if (newSet.size === totalQuestions) {
        setTimeout(saveRecord, 2000); // Auto-save on finish
      }
      return newSet;
    });

    setTimeout(() => {
      setCurrentClue(null);
      setFeedback(null);
    }, 1500);
  };

  // --- RENDER ---

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-slate-900/80 border border-white/10 rounded-2xl p-8 shadow-2xl text-white space-y-6 backdrop-blur">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-indigo-600/40 rounded-2xl">
              <Lock className="w-6 h-6 text-yellow-300" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-indigo-200">Trivia Master</p>
              <h1 className="text-2xl font-bold tracking-tight">Admin Access Required</h1>
            </div>
          </div>

          <p className="text-slate-300 text-sm leading-relaxed">
            This deployment is restricted to administrators. Enter the credentials configured with{' '}
            <code className="font-mono text-indigo-200">VITE_ADMIN_USERNAME</code> and{' '}
            <code className="font-mono text-indigo-200">VITE_ADMIN_PASSWORD</code>.
          </p>

          <form 
            onSubmit={(event) => event.preventDefault()}
            autoComplete="off"
            className="space-y-4"
          >
            <div>
              <label htmlFor="admin-username" className="text-xs uppercase text-slate-400">Username</label>
              <input
                id="admin-username"
                type="text"
                value={credentials.username}
                onChange={(e) => setCredentials((prev) => ({ ...prev, username: e.target.value }))}
                onKeyDown={handleCredentialsKeyDown}
                className="mt-1 w-full rounded-xl bg-slate-800 text-white border border-slate-700 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="admin"
                autoComplete="off"
                required
              />
            </div>
            <div>
              <label htmlFor="admin-password" className="text-xs uppercase text-slate-400">Password</label>
              <input
                id="admin-password"
                type="password"
                value={credentials.password}
                onChange={(e) => setCredentials((prev) => ({ ...prev, password: e.target.value }))}
                onKeyDown={handleCredentialsKeyDown}
                className="mt-1 w-full rounded-xl bg-slate-800 text-white border border-slate-700 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="••••••••"
                autoComplete="off"
                required
              />
            </div>

            {loginError && (
              <p className="text-sm text-red-400 text-center">{loginError}</p>
            )}

            <button
              type="button"
              onClick={handleLogin}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 rounded-xl flex items-center justify-center space-x-2 transition-colors"
            >
              <Lock className="w-4 h-4" />
              <span>Unlock Dashboard</span>
            </button>
          </form>

          <p className="text-xs text-slate-500 text-center">
            Defaults to <span className="font-mono text-slate-200">admin / trivia</span> when no env vars are provided. Authentication resets each time the page reloads.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-800 flex flex-col">
      
      {/* HEADER */}
      <header className="bg-indigo-700 text-white shadow-lg sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <HelpCircle className="w-8 h-8 text-yellow-400" />
            <h1 className="text-xl font-bold tracking-wider uppercase hidden sm:block">Trivia Master</h1>
          </div>
          
          <div className="flex items-center space-x-4 md:space-x-6">
            
            {/* Player Name Randomizer */}
            <div className="flex items-center bg-indigo-800 rounded-full px-3 py-1 space-x-2 border border-indigo-600">
              <User className="w-4 h-4 text-indigo-300" />
              <input 
                value={playerName} 
                onChange={(e) => setPlayerName(e.target.value)}
                className="bg-transparent border-none text-white text-sm w-24 md:w-32 focus:ring-0" 
              />
              <button onClick={randomizeName} title="Random Name">
                <Shuffle className="w-4 h-4 text-yellow-400 hover:rotate-180 transition-transform" />
              </button>
            </div>

            {/* Score */}
            <div className="flex flex-col items-end min-w-[60px]">
              <span className="text-[10px] text-indigo-200 uppercase font-semibold">Score</span>
              <span className={`text-xl font-black leading-none tabular-nums ${score < 0 ? 'text-red-300' : 'text-white'}`}>
                {score}
              </span>
            </div>

            {/* Controls */}
            <div className="flex space-x-1">
              <button 
                type="button"
                onClick={() => setShowRecords(true)}
                className="p-2 hover:bg-indigo-600 rounded-full transition-colors"
                title="History / Records"
              >
                <Database className="w-5 h-5" />
              </button>
              <button 
                type="button"
                onClick={() => { saveRecord(); startNewGame(); }}
                className="p-2 hover:bg-indigo-600 rounded-full transition-colors"
                title="Restart Game"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="p-2 hover:bg-indigo-600 rounded-full transition-colors"
                title="Lock App"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="flex-grow p-4 md:p-8 overflow-auto flex justify-center items-start">
        
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 space-y-4">
            <Loader className="w-12 h-12 text-indigo-600 animate-spin" />
            <p className="text-indigo-800 font-medium animate-pulse">{loadingMessage}</p>
          </div>
        ) : (
          <div className="bg-blue-900 p-2 rounded-xl shadow-2xl overflow-hidden max-w-7xl w-full border-4 border-blue-950">
            {/* GRID */}
            {/* We use inline styles for columns to support dynamic numbering safely */}
            <div 
              className="grid gap-2 min-w-[300px] md:min-w-[600px]"
              style={{ gridTemplateColumns: `repeat(${gameData.length}, minmax(0, 1fr))` }}
            > 
              
              {/* HEADERS */}
              {gameData.map((category, idx) => (
                <div key={idx} className="bg-indigo-800 h-24 flex items-center justify-center p-2 text-center rounded shadow-inner">
                  <h2 className="text-white font-bold text-xs md:text-sm lg:text-base uppercase tracking-widest text-shadow line-clamp-3">
                    {category.category}
                  </h2>
                </div>
              ))}

              {/* CELLS (Transposed) */}
              {[0, 1, 2, 3, 4].map((rowIndex) => (
                <React.Fragment key={`row-${rowIndex}`}>
                  {gameData.map((cat, catIndex) => {
                    const clue = cat.clues[rowIndex];
                    if (!clue) return <div key={catIndex} className="bg-blue-950/50"></div>; // Safety
                    
                    const isAnswered = answeredIds.has(clue.id);

                    return (
                      <button
                        key={clue.id}
                        disabled={isAnswered}
                        onClick={() => handleClueClick(clue)}
                        className={`
                          relative h-20 md:h-28 flex items-center justify-center rounded 
                          transition-all duration-300 transform border-b-4
                          ${isAnswered 
                            ? 'bg-blue-950 border-transparent cursor-default' 
                            : 'bg-blue-600 border-blue-800 hover:bg-blue-500 hover:border-blue-700 hover:-translate-y-1 active:translate-y-0'
                          }
                        `}
                      >
                        {isAnswered ? (
                          <span className="opacity-0">-</span> 
                        ) : (
                          <span className="text-yellow-400 font-black text-3xl md:text-5xl text-shadow-sm drop-shadow-lg">
                            {clue.level}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </React.Fragment>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* QUESTION MODAL */}
      {currentClue && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden transform transition-all scale-100">
            <div className="bg-indigo-700 p-6 flex justify-between items-center">
              <span className="text-indigo-200 font-bold tracking-widest uppercase text-sm">
                Difficulty Level {currentClue.level}
              </span>
              <button onClick={() => setCurrentClue(null)} className="text-white hover:bg-indigo-600 p-1 rounded-full">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-8 text-center">
              <h3 className="text-xl md:text-2xl font-serif text-slate-800 mb-8 leading-relaxed">
                {currentClue.question}
              </h3>

              {feedback ? (
                <div className={`flex flex-col items-center justify-center py-6 animate-in zoom-in duration-300 ${feedback === 'correct' ? 'text-green-600' : 'text-red-500'}`}>
                  {feedback === 'correct' ? (
                    <>
                      <Check className="w-16 h-16 mb-2" />
                      <span className="text-2xl font-bold">Correct!</span>
                    </>
                  ) : (
                    <>
                      <X className="w-16 h-16 mb-2" />
                      <div className="text-center">
                        <span className="text-2xl font-bold block">Incorrect</span>
                        <span className="text-slate-500 text-lg mt-2">Answer: {currentClue.answer}</span>
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
                      className="p-4 rounded-xl border-2 border-slate-100 bg-slate-50 hover:border-indigo-500 hover:bg-indigo-50 text-slate-700 font-semibold transition-all text-sm md:text-base text-left"
                    >
                      {option}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* RECORDS MODAL */}
      {showRecords && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="bg-slate-800 text-white p-4 flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <Trophy className="w-5 h-5 text-yellow-400" />
                <h3 className="font-bold uppercase tracking-wide">Recent Records</h3>
              </div>
              <button onClick={() => setShowRecords(false)}><X className="w-5 h-5" /></button>
            </div>
            <div className="p-0 max-h-96 overflow-y-auto">
              {records.length === 0 ? (
                <div className="p-8 text-center text-slate-400">No records found yet.</div>
              ) : (
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-slate-500 font-semibold border-b">
                    <tr>
                      <th className="p-3">Date</th>
                      <th className="p-3">Player</th>
                      <th className="p-3 text-right">Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {records.map((rec) => (
                      <tr key={rec.id} className="border-b last:border-0 hover:bg-slate-50">
                        <td className="p-3 text-slate-500">{rec.date}</td>
                        <td className="p-3 font-medium text-slate-800">{rec.name}</td>
                        <td className="p-3 text-right font-bold text-indigo-600">{rec.score}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
            <div className="p-3 bg-slate-50 border-t text-xs text-center text-slate-400">
              Records stored locally in browser
            </div>
          </div>
        </div>
      )}

      {/* STYLES */}
      <style>{`
        .text-shadow { text-shadow: 2px 2px 4px rgba(0,0,0,0.5); }
        .text-shadow-sm { text-shadow: 1px 1px 2px rgba(0,0,0,0.5); }
      `}</style>
    </div>
  );
}
