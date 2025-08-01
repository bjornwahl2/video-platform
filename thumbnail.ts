import { exec } from 'child_process';
import path from 'path';
import fs from 'fs';

export function generateThumbnail(videoUrl: string, id: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const output = path.join(__dirname, 'thumbnails', `${id}.jpg`);
    if (fs.existsSync(output)) return resolve();

    const cmd = \`ffmpeg -ss 00:00:01 -i "\${videoUrl}" -frames:v 1 -vf scale=160:-1 -q:v 40 "\${output}"\`;

    exec(cmd, (err) => {
      if (err) return reject(err);
      resolve();
    });
  });
}