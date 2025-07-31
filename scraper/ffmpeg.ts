import ffmpeg from 'fluent-ffmpeg';
import path from 'path';

export function generateThumbnail(videoUrl: string, thumbnailPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    ffmpeg(videoUrl)
      .screenshots({
        timestamps: ['50%'],
        filename: path.basename(thumbnailPath),
        folder: path.dirname(thumbnailPath),
        size: '320x240'
      })
      .on('end', resolve)
      .on('error', reject);
  });
}