import fs from 'fs/promises';
import path from 'path';

export interface Video {
  id: string;
  title: string;
  timestamp: string;
  duration: string;
  thumbnail: string;
  videoUrl: string;
}

const DB_PATH = path.resolve('videos.json');

export async function load(): Promise<Video[]> {
  try {
    const data = await fs.readFile(DB_PATH, 'utf-8');
    return JSON.parse(data) as Video[];
  } catch (err) {
    return [];
  }
}

export async function save(video: Video): Promise<void> {
  const videos = await load();
  videos.push(video);
  await fs.writeFile(DB_PATH, JSON.stringify(videos, null, 2), 'utf-8');
}

export async function has(id: string): Promise<boolean> {
  const videos = await load();
  return videos.some((v) => v.id === id);
}

export async function getById(id: string): Promise<Video | undefined> {
  const videos = await load();
  return videos.find((v) => v.id === id);
}

export async function getAllVideos(): Promise<{ id: string; url: string }[]> {
  const videos = await load();
  return videos.map((v) => ({
    id: v.id,
    url: v.videoUrl,
  }));
}
