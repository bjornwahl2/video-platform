import Database from 'better-sqlite3';

const db = new Database('videos.db');
db.exec(\`
  CREATE TABLE IF NOT EXISTS recordings (
    id TEXT PRIMARY KEY,
    title TEXT,
    timestamp TEXT,
    duration TEXT,
    videoUrl TEXT,
    thumbnail TEXT
  );
\`);

export function saveVideoIfNew(video: any): boolean {
  const exists = db.prepare('SELECT 1 FROM recordings WHERE id = ?').get(video.id);
  if (exists) return false;

  const stmt = db.prepare(\`
    INSERT INTO recordings (id, title, timestamp, duration, videoUrl, thumbnail)
    VALUES (@id, @title, @timestamp, @duration, @videoUrl, @thumbnail)
  \`);
  stmt.run(video);
  return true;
}