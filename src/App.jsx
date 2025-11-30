import React, { useState, useEffect, useCallback, useReducer, createContext, useContext } from 'react'; // Added createContext, useContext
import Header from './components/Header';
import QuestionModal from './components/QuestionModal';
import GameBoard from './components/GameBoard';
import RecordsModal from './components/RecordsModal';
import PlayersModal from './components/PlayersModal';
import FullScreenLoader from './components/Loader';
import CategoriesModal from './components/CategoriesModal';
import HowToPlayModal from './components/HowToPlayModal';
import AboutModal from './components/AboutModal';
import { initDB, getPlayers, addPlayer, saveGame, getGameHistory, updatePlayer as updatePlayerDB, deletePlayer as deletePlayerDB } from './db';

// --- CONSTANTS ---
import { CATEGORY_IDS } from './utils/categories';

// --- HELPER: HTML DECODER ---
const decodeHTML = (html) => {
  const txt = document.createElement('textarea');
  txt.innerHTML = html;
  return txt.value;
};

// --- HELPER: DELAY ---
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// --- TYPE DEFINITIONS ---
/**
 * @typedef {object} Clue
 * @property {string} id
 * @property {number} level
 * @property {number} value
 * @property {string} question
 * @property {string} answer
 * @property {string[]} options
 */

/**
 * @typedef {object} CategoryData
 * @property {string} category
 * @property {Clue[]} clues
 */

/**
 * @typedef {object} GameState
 * @property {CategoryData[]} gameData
 * @property {boolean} loading
 * @property {string} loadingMessage
 * @property {number} score
 * @property {Set<string>} answeredIds
 * @property {Clue|null} currentClue
 * @property {'correct'|'incorrect'|null} feedback
 * @property {number} timer // Added timer property
 * @property {boolean} isPaused // Added isPaused property
 */

/**
 * @typedef {'START_NEW_GAME'|'FETCH_SUCCESS'|'FETCH_FAILED'|'SET_LOADING_MESSAGE'|'SET_CURRENT_CLUE'|'ANSWER_QUESTION'|'CLOSE_QUESTION'|'DECREMENT_TIMER'|'TIMER_EXPIRED'|'PAUSE_GAME'|'RESUME_GAME'} ActionType // Added timer and pause related actions
 */

/**
 * @typedef {object} Action
 * @property {ActionType} type
 * @property {any} [payload]
 */


// --- THEME CONTEXT ---
export const ThemeContext = createContext(null);

/** @type {GameState} */
const initialState = {
  gameData: [],
  loading: true,
  loadingMessage: "Initializing...",
  score: 0,
  answeredIds: new Set(),
  currentClue: null,
  feedback: null,
  timer: 15, // Initial timer value
  isPaused: false, // Initialize to not paused
};

/**
 * @param {GameState} state
 * @param {Action} action
 * @returns {GameState}
 */
function gameReducer(state, action) {
  switch (action.type) {
    case 'START_NEW_GAME':
      return {
        ...state,
        loading: true,
        score: 0,
        answeredIds: new Set(),
        feedback: null,
        currentClue: null,
        gameData: [],
        timer: 15, // Reset timer
      };
    case 'FETCH_SUCCESS':
      return {
        ...state,
        gameData: action.payload,
        loading: false,
      };
    case 'FETCH_FAILED':
        return {
            ...state,
            loadingMessage: action.payload,
            loading: false, // Stop loading on failure
        };
    case 'SET_LOADING_MESSAGE':
        return {
            ...state,
            loadingMessage: action.payload,
        };
    case 'SET_CURRENT_CLUE':
        return {
            ...state,
            currentClue: action.payload,
            feedback: null,
            timer: 15, // Start timer for new clue
        };
    case 'ANSWER_QUESTION':
        const { isCorrect, clue } = action.payload;
        console.log('ANSWER_QUESTION case:', { isCorrect, clueValue: clue.value, stateScore: state.score });
        const newScore = state.score + (isCorrect ? clue.value : -clue.value);
        const newAnsweredIds = new Set(state.answeredIds).add(clue.id);
        console.log(`ANSWER_QUESTION reducer: score=${state.score} + ${isCorrect ? '+' : '-'}${clue.value} = ${newScore}, feedback=${isCorrect ? 'correct' : 'incorrect'}`);
        return {
            ...state,
            score: newScore,
            answeredIds: newAnsweredIds,
            feedback: isCorrect ? 'correct' : 'incorrect',
            timer: 0, // Stop timer after answer
        };
    case 'CLOSE_QUESTION':
        return {
            ...state,
            currentClue: null,
            feedback: null,
            timer: 0, // Stop timer
        };
    case 'DECREMENT_TIMER':
        return {
            ...state,
            timer: state.timer - 1,
        };
    case 'TIMER_EXPIRED':
        // Handle incorrect answer due to timer expiry
        const expiredScore = state.score - (state.currentClue?.value || 0); // Deduct points
        const expiredAnsweredIds = new Set(state.answeredIds).add(state.currentClue?.id || '');
        return {
            ...state,
            score: expiredScore,
            answeredIds: expiredAnsweredIds,
            feedback: 'incorrect',
            timer: 0,
            // currentClue will be set to null by CLOSE_QUESTION after a timeout
        };
    case 'PAUSE_GAME':
        return {
            ...state,
            isPaused: true,
        };
    case 'RESUME_GAME':
        return {
            ...state,
            isPaused: false,
        };
    default:
      return state;
  }
}

export default function App() {
  const [gameState, dispatch] = useReducer(gameReducer, initialState);

  // User & Records State (not part of the reducer)
  const [playerName, setPlayerName] = useState(() => {
    const savedPlayerName = localStorage.getItem('trivia_playerName');
    return savedPlayerName ? savedPlayerName : "Player 1";
  });
  const [showRecords, setShowRecords] = useState(false);
  const [records, setRecords] = useState([]);

  const [players, setPlayers] = useState([]);
  const [showPlayers, setShowPlayers] = useState(false);
  const [categoryCount, setCategoryCount] = useState(() => {
    const savedCount = localStorage.getItem('trivia_categoryCount');
    return savedCount ? Number(savedCount) : 5;
  });
  const [selectedCategoryIds, setSelectedCategoryIds] = useState(() => {
    const savedCategories = localStorage.getItem('trivia_selectedCategoryIds');
    return savedCategories ? JSON.parse(savedCategories) : [];
  }); // New state for selected categories
  const [showCategoriesModal, setShowCategoriesModal] = useState(false); // New state for categories modal visibility
  const [showHowToPlayModal, setShowHowToPlayModal] = useState(false); // New state for HowToPlay modal visibility
  const [showAboutModal, setShowAboutModal] = useState(false); // New state for About modal visibility
  const [selectedDifficulty, setSelectedDifficulty] = useState(() => {
    const savedDifficulty = localStorage.getItem('trivia_difficulty');
    return savedDifficulty ? savedDifficulty : "any";
  });

  // Dark Mode State
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Initialize from localStorage or system preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      return savedTheme === 'dark';
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Apply 'dark' class to html element
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const toggleDarkMode = useCallback(() => {
    setIsDarkMode(prevMode => !prevMode);
  }, []);

  // Save playerName to localStorage
  useEffect(() => {
    localStorage.setItem('trivia_playerName', playerName);
  }, [playerName]);

  // Save selectedCategoryIds to localStorage
  useEffect(() => {
    localStorage.setItem('trivia_selectedCategoryIds', JSON.stringify(selectedCategoryIds));
  }, [selectedCategoryIds]);

  // Save categoryCount to localStorage
  useEffect(() => {
    localStorage.setItem('trivia_categoryCount', categoryCount.toString());
  }, [categoryCount]);

  // Save selectedDifficulty to localStorage
  useEffect(() => {
    localStorage.setItem('trivia_difficulty', selectedDifficulty);
  }, [selectedDifficulty]);

  /**
   * @param {number} count - The number of categories to fetch if no specific categories are provided.
   * @param {number[]} [categoriesToUse] - Optional array of specific category IDs to use.
   */
  const startNewGame = useCallback(async (count, categoriesToUse) => {
    dispatch({ type: 'START_NEW_GAME' });

              let finalCategoryIds = categoriesToUse;
              if (!finalCategoryIds || finalCategoryIds.length === 0) {
                // Fallback to selectedCategoryIds if provided, otherwise random
                finalCategoryIds = selectedCategoryIds.length > 0 
                  ? selectedCategoryIds 
                  : [...CATEGORY_IDS].sort(() => 0.5 - Math.random()).slice(0, count);
              }
              
              const newGameData = [];
    
              try {
                for (let i = 0; i < finalCategoryIds.length; i++) {
                  const catId = finalCategoryIds[i];
                  dispatch({ type: 'SET_LOADING_MESSAGE', payload: `Fetching Category ${i + 1} of ${finalCategoryIds.length}...` });
    
                  if (i > 0) await wait(5000); 
    
                  try {
                    let url = `https://opentdb.com/api.php?amount=5&category=${catId}&type=multiple`;
                    if (selectedDifficulty !== "any") {
                      url += `&difficulty=${selectedDifficulty}`;
                    }
                    const res = await fetch(url);
                    const data = await res.json();
          if (!data.results || data.results.length === 0) {
            console.warn(`Category ${catId} failed or has no data. Skipping.`);
            continue;
          }

          const difficultyMap = { easy: 1, medium: 2, hard: 3 };
          const sortedQuestions = data.results.sort((a, b) => difficultyMap[a.difficulty] - difficultyMap[b.difficulty]);

          newGameData.push({
            category: decodeHTML(data.results[0].category).replace("Entertainment: ", "").replace("Science: ", ""),
            clues: sortedQuestions.map((q, index) => ({
              id: `${catId}-${index}-${Math.random().toString(36).substr(2, 9)}`,
              level: index + 1,
              value: (index + 1) * 10,
              question: decodeHTML(q.question),
              answer: decodeHTML(q.correct_answer),
              options: [...q.incorrect_answers, q.correct_answer]
                .map(decodeHTML)
                .sort(() => Math.random() - 0.5)
            }))
          });
        } catch (innerError) {
          console.warn(`Failed to fetch category ${catId}`, innerError);
        }
      }

      if (newGameData.length === 0) {
        dispatch({ type: 'FETCH_FAILED', payload: "Failed to load questions. Please try again." });
        return;
      }

      dispatch({ type: 'FETCH_SUCCESS', payload: newGameData });
    } catch (error) {
      console.error("Critical error fetching questions:", error);
      dispatch({ type: 'FETCH_FAILED', payload: "Error connecting to Trivia API." });
    } // Missing closing brace for try-catch
  }, [selectedCategoryIds, selectedDifficulty, dispatch]);

  const loadGameHistory = useCallback(() => {
    const history = getGameHistory();
    setRecords(history);
  }, []);

  useEffect(() => {
    const initialize = async () => {
      await initDB();
      const players = getPlayers();
      setPlayers(players);
      if (players.length > 0) {
        setPlayerName(players[0].name);
      }
      loadGameHistory();
      startNewGame(5, selectedCategoryIds);
    };
    initialize();
  }, [loadGameHistory, startNewGame, selectedCategoryIds]);

  const saveRecord = useCallback(() => {
    if (gameState.score === 0) return;
    const player = players.find(p => p.name === playerName);
    if (player) {
      saveGame(player.id, gameState.score);
      loadGameHistory();
    }
  }, [gameState.score, playerName, players, loadGameHistory]);

  /**
   * @param {string} name - The name of the new player.
   * @returns {boolean} True if the player was added successfully, false otherwise.
   */
  const addNewPlayer = useCallback((name) => {
    const result = addPlayer(name);
    if (result.success) {
      const newPlayers = getPlayers();
      setPlayers(newPlayers);
      return true;
    }
    alert(result.error);
    return false;
  }, []);

  const randomizePlayer = useCallback(() => {
    if (players.length > 0) {
      const randomPlayer = players[Math.floor(Math.random() * players.length)];
      setPlayerName(randomPlayer.name);
    }
  }, [players]);

  /**
   * @param {number} id - The ID of the player to update.
   * @param {string} newName - The new name for the player.
   * @returns {boolean} True if the player was updated successfully, false otherwise.
   */
  const onUpdatePlayer = useCallback((id, newName) => {
    const result = updatePlayerDB(id, newName);
    if (result.success) {
      const newPlayers = getPlayers();
      setPlayers(newPlayers);
      return true;
    }
    alert(result.error);
    return false;
  }, []);

  /**
   * @param {number} id - The ID of the player to delete.
   * @returns {boolean} True if the player was deleted successfully, false otherwise.
   */
  const onDeletePlayer = useCallback((id) => {
    const result = deletePlayerDB(id);
    if (result.success) {
      const newPlayers = getPlayers();
      setPlayers(newPlayers);
      // If the deleted player was the current player, reset playerName
      if (playerName === players.find(p => p.id === id)?.name) {
        setPlayerName(newPlayers.length > 0 ? newPlayers[0].name : "Player 1");
      }
      return true;
    }
    alert(result.error);
    return false;
  }, [playerName, players]);

  const onSaveCategories = useCallback((categories) => {
    setSelectedCategoryIds(categories);
    setShowCategoriesModal(false);
    // Optionally, start a new game with the selected categories immediately
    // startNewGame(categories.length, categories); 
  }, []);

  const onCancelCategories = useCallback(() => {
    setShowCategoriesModal(false);
  }, []);

  /**
   * @param {Clue} clue - The clue object that was clicked.
   */
  const handleClueClick = useCallback((clue) => {
    if (gameState.answeredIds.has(clue.id)) return;
    dispatch({ type: 'SET_CURRENT_CLUE', payload: clue });
  }, [gameState.answeredIds]);

  /**
   * @param {string} selectedOption - The option selected by the user.
   */
  const handleAnswer = useCallback((selectedOption) => {
    if (!gameState.currentClue) return;

    const normalizeString = (str) => {
      // Trim first, decode HTML entities, convert to lowercase, remove all non-alphanumeric
      const trimmed = String(str).trim();
      const decoded = decodeHTML(trimmed);
      return decoded
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '');  // Remove everything except a-z and 0-9
    };
    
    const selectedNorm = normalizeString(selectedOption);
    const answerNorm = normalizeString(gameState.currentClue.answer);
    const isCorrect = selectedNorm === answerNorm;
    
    // Always log for debugging
    console.log('=== ANSWER CHECK ===');
    console.log('Selected:', selectedOption);
    console.log('Correct Answer:', gameState.currentClue.answer);
    console.log('Selected (normalized):', selectedNorm);
    console.log('Answer (normalized):', answerNorm);
    console.log('Match:', isCorrect);
    console.log('Clue object:', gameState.currentClue);
    console.log('====================');
    
    dispatch({ type: 'ANSWER_QUESTION', payload: { isCorrect, clue: gameState.currentClue } });

    setTimeout(() => {
      dispatch({ type: 'CLOSE_QUESTION' });
    }, 1500);
  }, [gameState.currentClue]);

  // Timer logic
  useEffect(() => {
    let timerInterval;
    if (gameState.currentClue && gameState.timer > 0 && !gameState.isPaused) { // Only decrement if not paused
      timerInterval = setInterval(() => {
        dispatch({ type: 'DECREMENT_TIMER' });
      }, 1000);
    } else if (gameState.timer === 0 && gameState.currentClue && !gameState.isPaused && !gameState.feedback) { // Only expire if not paused AND no feedback yet
      // Timer expired (user didn't answer in time)
      console.log('Timer expired - dispatching TIMER_EXPIRED');
      dispatch({ type: 'TIMER_EXPIRED' });
      setTimeout(() => {
        dispatch({ type: 'CLOSE_QUESTION' });
      }, 1500); // Close after showing feedback
    }

    return () => clearInterval(timerInterval);
  }, [gameState.currentClue, gameState.timer, dispatch, gameState.isPaused, gameState.feedback]);

  useEffect(() => {
      if(gameState.gameData.length === 0) return;
      const totalQuestions = gameState.gameData.length * 5;
      if (gameState.answeredIds.size === totalQuestions) {
          setTimeout(saveRecord, 2000);
      }
  }, [gameState.answeredIds, gameState.gameData.length, saveRecord]);

  const handleEndGame = useCallback(() => {
    if (gameState.score !== 0) {
      const confirmEnd = window.confirm(
        `Your current score is ${gameState.score}. Do you want to save this score and end the game?`
      );
      if (confirmEnd) {
        saveRecord();
      }
    }
    startNewGame(categoryCount);
  }, [gameState.score, categoryCount, saveRecord, startNewGame]);

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleDarkMode }}>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-200 text-slate-800 font-sans flex flex-col">
        <Header
          playerName={playerName}
          setPlayerName={setPlayerName}
          randomizePlayer={randomizePlayer}
          score={gameState.score}
          setShowRecords={setShowRecords}
          setShowPlayers={setShowPlayers}
          saveRecord={saveRecord}
          startNewGame={() => {
            if (gameState.score > 0) {
              const confirmStart = window.confirm(
                `You have an unsaved score of ${gameState.score}. Are you sure you want to start a new game and lose your current progress?`
              );
              if (!confirmStart) {
                return;
              }
            }
            startNewGame(categoryCount);
          }}
          onEndGame={handleEndGame}
          categoryCount={categoryCount}
          setCategoryCount={setCategoryCount}
          players={players}
          difficulty={selectedDifficulty}
          setDifficulty={setSelectedDifficulty}
          currentScore={gameState.score} // Pass current score for confirmation logic
        />

        <main className="flex-grow p-4 md:p-8 overflow-auto flex justify-center items-start">
          {gameState.loading ? (
            <FullScreenLoader message={gameState.loadingMessage} />
          ) : (
            <GameBoard
              gameData={gameState.gameData}
              answeredIds={gameState.answeredIds}
              handleClueClick={handleClueClick}
            />
          )}
        </main>

              <QuestionModal
                currentClue={gameState.currentClue}
                handleAnswer={handleAnswer}
                feedback={gameState.feedback}
                timer={gameState.timer} // Pass timer value
                isPaused={gameState.isPaused} // Pass isPaused value
                onClose={() => dispatch({ type: 'CLOSE_QUESTION' })}
              />
        <RecordsModal
          showRecords={showRecords}
          setShowRecords={setShowRecords}
          records={records}
        />
              <PlayersModal
                show={showPlayers}
                onClose={() => setShowPlayers(false)}
                players={players}
                onAddPlayer={addNewPlayer}
                onUpdatePlayer={onUpdatePlayer}
                onDeletePlayer={onDeletePlayer}
              />
        
              <CategoriesModal
                show={showCategoriesModal}
                onClose={onCancelCategories}
                onSave={onSaveCategories}
                initialSelectedCategoryIds={selectedCategoryIds}
              />
              <HowToPlayModal
                show={showHowToPlayModal}
                onClose={() => setShowHowToPlayModal(false)}
              />
              <AboutModal
                show={showAboutModal}
                onClose={() => setShowAboutModal(false)}
              />
            </div>
    </ThemeContext.Provider>
  );
}

