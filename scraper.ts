console.log("🚀 Scraper started");
import fs from 'fs/promises';
import fsSync from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import { createThumbnail } from './thumbnail';
import { getAllVideos } from './video';

const execPromise = promisify(exec);

async function main() {
  console.log('🚀 Starting scraper...');

  const videos = await getAllVideos();
  console.log(`📦 Found ${videos.length} video(s) to process.`);

  for (const video of videos) {
    const { id, url } = video;
    const thumbnailPath = path.join(process.cwd(), 'thumbnails', `${id.replace(/\.mp4$/, '')}.jpg`);
    const exists = fsSync.existsSync(thumbnailPath);
    if (exists) {
      console.log(`⏭️ Skipping existing thumbnail: ${id}`);
      continue;
    }

    console.log(`🎯 Generating thumbnail for: ${id}`);
    await createThumbnail(url, id);
  }

  console.log('✅ Scraper finished.');
}

main().catch((err) => {
  console.error('❌ Scraper crashed:', err);
});