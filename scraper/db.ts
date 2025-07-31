import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';

const DB_PATH = path.join(__dirname, 'videos.db');

let db: any;

export async function initDB() {
  db = await open({
    filename: DB_PATH,
    driver: sqlite3.Database
  });

  await db.run(`CREATE TABLE IF NOT EXISTS recordings (
    id TEXT PRIMARY KEY,
    timestamp TEXT,
    videoUrl TEXT UNIQUE,
    duration TEXT,
    thumbnail TEXT
  )`);
}

export async function saveVideoIfNew(videoUrl: string) {
  await initDB();
  const timestamp = new Date().toISOString();
  const id = uuidv4();
  const existing = await db.get('SELECT * FROM recordings WHERE videoUrl = ?', videoUrl);
  if (existing) return null;

  const thumbnail = `thumbnails/${id}.jpg`;
  await db.run('INSERT INTO recordings (id, timestamp, videoUrl, duration, thumbnail) VALUES (?, ?, ?, ?, ?)',
    id, timestamp, videoUrl, '00:00', thumbnail);
  return { id, videoUrl };
}

export async function getAllRecordings() {
  await initDB();
  return await db.all('SELECT * FROM recordings ORDER BY timestamp DESC');
}

export async function getRecordingById(id: string) {
  await initDB();
  return await db.get('SELECT * FROM recordings WHERE id = ?', id);
}