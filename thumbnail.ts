import fs from "fs";
import path from "path";
import ffmpeg from "fluent-ffmpeg";
import ffmpegInstaller from "@ffmpeg-installer/ffmpeg";
import { promisify } from "util";
import { pipeline } from "stream";
import fetch from "node-fetch";

const streamPipeline = promisify(pipeline);

ffmpeg.setFfmpegPath(ffmpegInstaller.path);

export async function createThumbnail(videoUrl: string, outputPath: string): Promise<void> {
  const tempVideoPath = path.join("/tmp", path.basename(videoUrl).replace(/[^a-zA-Z0-9.]/g, "_"));

  try {
    // Download the video
    const response = await fetch(videoUrl);
    if (!response.ok || !response.body) {
      throw new Error(`Failed to fetch video: ${response.statusText}`);
    }

    await streamPipeline(response.body, fs.createWriteStream(tempVideoPath));

    // Get video duration
    const duration = await getVideoDuration(tempVideoPath);
    const midPoint = duration / 2;

    // Ensure thumbnails folder exists
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Generate thumbnail
    await new Promise<void>((resolve, reject) => {
      ffmpeg(tempVideoPath)
        .on("end", () => {
          fs.unlink(tempVideoPath, () => {}); // cleanup
          resolve();
        })
        .on("error", (err) => {
          fs.unlink(tempVideoPath, () => {}); // cleanup
          reject(err);
        })
        .screenshots({
          timestamps: [midPoint],
          filename: path.basename(outputPath),
          folder: dir,
          size: "320x?",
        });
    });
  } catch (error) {
    console.error("❌ Failed to create thumbnail:", error);
  }
}

function getVideoDuration(filePath: string): Promise<number> {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (err, metadata) => {
      if (err) return reject(err);
      resolve(metadata.format.duration || 1);
    });
  });
}