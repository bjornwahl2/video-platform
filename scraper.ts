import { extractLatestVideo } from './extract';
import { saveVideoIfNew } from './video';
import { generateThumbnail } from './thumbnail';

async function run() {
  try {
    const video = await extractLatestVideo();
    if (!video) return;

    const saved = saveVideoIfNew(video);
    if (!saved) return;

    await generateThumbnail(video.videoUrl, video.id);
    console.log('[✓] New video saved:', video.videoUrl);
  } catch (err) {
    console.error('[!] Scraper error:', err);
  }
}

setInterval(run, 5000);
run();