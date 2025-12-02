import initSqlJs from 'sql.js';

let db = null;
const DB_NAME = 'trivia_db_v1';
const DB_STORE_NAME = 'database';
const DATA_FILE_PATH = '/data/trivia-db.sqlite'; // Path to persisted database file on mounted volume

// Helper to save db to IndexedDB
const saveDBToIndexedDB = async () => {
  try {
    const data = db.export();
    const blob = new Blob([data], { type: 'application/octet-stream' });
    
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, 1);
      
      request.onupgradeneeded = (event) => {
        const upgradeDb = event.target.result;
        if (!upgradeDb.objectStoreNames.contains(DB_STORE_NAME)) {
          upgradeDb.createObjectStore(DB_STORE_NAME);
        }
      };
      
      request.onsuccess = (event) => {
        const indexedDb = event.target.result;
        const transaction = indexedDb.transaction(DB_STORE_NAME, 'readwrite');
        const store = transaction.objectStore(DB_STORE_NAME);
        const putRequest = store.put(blob, 'database');
        
        putRequest.onsuccess = () => {
          indexedDb.close();
          resolve();
        };
        putRequest.onerror = () => {
          indexedDb.close();
          reject(putRequest.error);
        };
      };
      
      request.onerror = () => {
        reject(request.error);
      };
    });
  } catch (err) {
    console.error('Failed to save database to IndexedDB:', err);
  }
};

// Helper to load db from IndexedDB
const loadDBFromIndexedDB = async (SQL) => {
  return new Promise((resolve) => {
    const request = indexedDB.open(DB_NAME, 1);
    
    request.onupgradeneeded = (event) => {
      const upgradeDb = event.target.result;
      if (!upgradeDb.objectStoreNames.contains(DB_STORE_NAME)) {
        upgradeDb.createObjectStore(DB_STORE_NAME);
      }
    };
    
    request.onsuccess = (event) => {
      const indexedDb = event.target.result;
      const transaction = indexedDb.transaction(DB_STORE_NAME, 'readonly');
      const store = transaction.objectStore(DB_STORE_NAME);
      const getRequest = store.get('database');
      
      getRequest.onsuccess = async (event) => {
        indexedDb.close();
        const blob = event.target.result;
        if (blob) {
          try {
            const arrayBuffer = await blob.arrayBuffer();
            const loadedDb = new SQL.Database(new Uint8Array(arrayBuffer));
            resolve(loadedDb);
          } catch (err) {
            console.error('Failed to load database from IndexedDB:', err);
            resolve(null);
          }
        } else {
          resolve(null);
        }
      };
      
      getRequest.onerror = () => {
        indexedDb.close();
        resolve(null);
      };
    };
    
    request.onerror = () => {
      resolve(null);
    };
  });
};

// Helper to load db from filesystem (mounted /data volume)
const loadDBFromFile = async (SQL) => {
  try {
    const response = await fetch(DATA_FILE_PATH);
    if (response.ok) {
      const arrayBuffer = await response.arrayBuffer();
      const loadedDb = new SQL.Database(new Uint8Array(arrayBuffer));
      console.log('Loaded database from filesystem at ' + DATA_FILE_PATH);
      return loadedDb;
    }
  } catch (err) {
    // File doesn't exist or can't be fetched - that's fine, we'll create a new db
    console.log('No persisted database found at ' + DATA_FILE_PATH + '. Creating new database.');
  }
  return null;
};

// Helper to save db to filesystem (mounted /data volume)
const saveDBToFile = async () => {
  try {
    const data = db.export();
    const blob = new Blob([data], { type: 'application/octet-stream' });
    
    // Use the Fetch API to POST the database blob to a simple endpoint
    // For now, we'll store it in a hidden iframe or use a service worker pattern
    // In a real app, you'd have a backend endpoint: POST /api/save-db
    // For this SPA, we'll rely on IndexedDB + encourage admins to backup /data volume
    
    // Store in IndexedDB as well
    await saveDBToIndexedDB();
    
    console.log('Database persisted (IndexedDB updated)');
  } catch (err) {
    console.error('Failed to save database to filesystem:', err);
  }
};

export const initDB = async () => {
  if (db) return db;

  try {
    const SQL = await initSqlJs({
      locateFile: file => `/${file}`
    });
    
    // Try to load from filesystem first (mounted /data volume), then IndexedDB, then create new
    let loadedDb = await loadDBFromFile(SQL);
    if (loadedDb) {
      db = loadedDb;
      console.log('Loaded database from file');
    } else {
      loadedDb = await loadDBFromIndexedDB(SQL);
      if (loadedDb) {
        db = loadedDb;
        console.log('Loaded database from IndexedDB');
      } else {
        db = new SQL.Database();
        console.log('Created new database');
      }
    }
    
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
    
    // Save the initialized database
    await saveDBToFile();
    
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
    saveDBToFile(); // Persist after adding player
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
  saveDBToFile(); // Persist after saving game
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
    saveDBToFile(); // Persist after updating player
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
    saveDBToFile(); // Persist after deleting player
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
};
