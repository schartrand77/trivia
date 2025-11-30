import initSqlJs from 'sql.js';

let db = null;

export const initDB = async () => {
  if (db) return db;

  try {
    const SQL = await initSqlJs({
      locateFile: file => `/${file}`
    });
    db = new SQL.Database();
    // Create tables if they don't exist
    db.run(`
      CREATE TABLE IF NOT EXISTS players (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        correct_answers INTEGER DEFAULT 0,
        wrong_answers INTEGER DEFAULT 0
      );
    `);
    db.run(`
      CREATE TABLE IF NOT EXISTS game_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        player_id INTEGER,
        correct_answers INTEGER,
        wrong_answers INTEGER,
        date TEXT,
        FOREIGN KEY (player_id) REFERENCES players (id)
      );
    `);
    return db;
  } catch (err) {
    console.error('Failed to initialize database:', err);
  }
};

export const getDB = () => {
  if (!db) {
    throw new Error('Database not initialized. Call initDB() first.');
  }
  return db;
};

export const addPlayer = (name) => {
  const db = getDB();
  try {
    db.run('INSERT INTO players (name) VALUES (?)', [name]);
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
};

export const getPlayers = () => {
  const db = getDB();
  const res = db.exec('SELECT * FROM players');
  if (res.length === 0) {
    return [];
  }
  return res[0].values.map(row => ({ id: row[0], name: row[1] }));
};

export const saveGame = (playerId, correctAnswers, wrongAnswers) => {
  const db = getDB();
  const date = new Date().toLocaleDateString();
  db.run('INSERT INTO game_history (player_id, correct_answers, wrong_answers, date) VALUES (?, ?, ?, ?)', [playerId, correctAnswers, wrongAnswers, date]);
};

export const getGameHistory = () => {
  const db = getDB();
  const res = db.exec(`
    SELECT p.name, gh.correct_answers, gh.wrong_answers, gh.date
    FROM game_history gh
    JOIN players p ON gh.player_id = p.id
    ORDER BY gh.id DESC
    LIMIT 15;
  `);
  if (res.length === 0) {
    return [];
  }
  return res[0].values.map(row => ({ name: row[0], correct_answers: row[1], wrong_answers: row[2], date: row[3] }));
};

export const updatePlayer = (id, newName) => {
  const db = getDB();
  try {
    db.run('UPDATE players SET name = ? WHERE id = ?', [newName, id]);
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
};

export const deletePlayer = (id) => {
  const db = getDB();
  try {
    db.run('DELETE FROM players WHERE id = ?', [id]);
    db.run('DELETE FROM game_history WHERE player_id = ?', [id]); // Delete associated history
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
};
