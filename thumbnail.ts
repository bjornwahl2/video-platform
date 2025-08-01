import ffmpegPath from '@ffmpeg-installer/ffmpeg';
import ffmpeg from 'fluent-ffmpeg';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import fetch from 'node-fetch';

// ⬇️ ESM-compatible __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Set ffmpeg path from installer
ffmpeg.setFfmpegPath(ffmpegPath.path);

export async function createThumbnail(videoUrl: string, id: string): Promise<void> {
  const outputFilename = `${id}.jpg`;
  const outputPath = path.join(__dirname, 'thumbnails', outputFilename);

  // Check if file already exists
  if (fs.existsSync(outputPath)) {
    console.log(`✅ Skipping existing thumbnail: ${outputFilename}`);
    return;
  }

  try {
    // Get video metadata duration
    const duration = await getVideoDuration(videoUrl);
    const midPoint = duration > 0 ? duration / 2 : 5;

    console.log(`📦 Running: ffmpeg -y -ss ${midPoint.toFixed(2)} -i "${videoUrl}" -vframes 1 -q:v 2 "${outputPath}"`);

    await new Promise<void>((resolve, reject) => {
      ffmpeg(videoUrl)
        .inputOptions([`-ss ${midPoint.toFixed(2)}`])
        .outputOptions(['-vframes 1', '-q:v 2'])
        .on('end', () => {
          console.log(`🖼️  Thumbnail saved: ${outputPath}`);
          if (fs.existsSync(outputPath)) {
            console.log(`✅ Exists after write? true ${outputPath}`);
            resolve();
          } else {
            console.warn(`⚠️  FFmpeg completed but did not create file for: ${id}`);
            resolve(); // resolve to continue even if not created
          }
        })
        .on('error', (err) => {
          console.error(`❌ FFmpeg error for ${id}:`, err.message);
          reject(err);
        })
        .save(outputPath);
    });
  } catch (err) {
    console.error(`❌ Failed to create thumbnail for ${id}:`, err);
  }
}

async function getVideoDuration(videoUrl: string): Promise<number> {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(videoUrl, (err, metadata) => {
      if (err) {
        console.warn(`⚠️  Failed to fetch metadata for: ${videoUrl}`);
        resolve(0); // fallback
      } else {
        resolve(metadata.format.duration || 0);
      }
    });
  });
}