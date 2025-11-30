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
        name TEXT NOT NULL UNIQUE
      );
    `);
    db.run(`
      CREATE TABLE IF NOT EXISTS game_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        player_id INTEGER,
        score INTEGER,
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

export const saveGame = (playerId, score) => {
  const db = getDB();
  const date = new Date().toLocaleDateString();
  db.run('INSERT INTO game_history (player_id, score, date) VALUES (?, ?, ?)', [playerId, score, date]);
};

export const getGameHistory = () => {
  const db = getDB();
  const res = db.exec(`
    SELECT p.name, gh.score, gh.date
    FROM game_history gh
    JOIN players p ON gh.player_id = p.id
    ORDER BY gh.id DESC
    LIMIT 15;
  `);
  if (res.length === 0) {
    return [];
  }
  return res[0].values.map(row => ({ name: row[0], score: row[1], date: row[2] }));
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
