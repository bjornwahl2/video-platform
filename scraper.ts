import { chromium } from "playwright";
import fs from "fs";
import path from "path";
import { createThumbnail } from "./thumbnail";

const VIDEO_BASE_URL = "https://video.skynordic.no/videoviewer/FileHandler.ashx?Fila=";
const VIDEO_PAGE_URL = "https://video.skynordic.no/videoviewer/vd4.aspx?station=Osfossen&alle=Alle&height=480&width=600";
async function waitForDropdownToStabilize(page: any, selector: string, stableCount: number, maxWait = 30000) {
  let lastCount = 0;
  let stableFor = 0;
  const pollInterval = 500;
  const start = Date.now();

  while (Date.now() - start < maxWait) {
    const currentCount = await page.$$eval(`${selector} option`, opts => opts.length);
    console.log(`⏳ Dropdown has ${currentCount} options...`);

    if (currentCount === lastCount) {
      stableFor += pollInterval;
      if (stableFor >= 3000 && currentCount >= stableCount) return;
    } else {
      stableFor = 0;
      lastCount = currentCount;
    }

    await new Promise((res) => setTimeout(res, pollInterval));
  }

  throw new Error(`Dropdown did not stabilize above ${stableCount} options in time.`);
}

export async function extractAllVideos(): Promise<void> {
  console.log("👀 Scraper started...");
  const browser = await chromium.launch();
  const page = await browser.newPage();

  console.log("🌐 Fetching dropdown page...");
  await page.goto(VIDEO_PAGE_URL, { waitUntil: "networkidle" });

  console.log("⏳ Waiting for dropdown to fully load...");
  await page.waitForSelector("select#DropDownList1");
  await waitForDropdownToStabilize(page, "select#DropDownList1", 100);

  const videos = await page.$$eval("select#DropDownList1 option", (options) => {
    return options
      .map((opt) => {
        const value = opt.getAttribute("value");
        const text = opt.textContent?.trim();
        if (!value || !text) return null;
        const filename = value.split("\\").pop();
        const url = "https://video.skynordic.no/videoviewer/FileHandler.ashx?Fila=" + encodeURIComponent(value);
        return { id: filename!, url, label: text };
      })
      .filter((v): v is { id: string; url: string; label: string } => v !== null);
  });

  console.log(`📦 Found ${videos.length} videos.`);

  await browser.close();

  const outputFile = "videos.json";
  fs.writeFileSync(outputFile, JSON.stringify(videos, null, 2), "utf-8");

  const thumbnailsDir = path.join(process.cwd(), "thumbnails");
  if (!fs.existsSync(thumbnailsDir)) fs.mkdirSync(thumbnailsDir);

  for (const video of videos) {
    const outputPath = path.join(thumbnailsDir, `${video.id}.jpg`);
    if (fs.existsSync(outputPath)) {
      console.log(`✅ Skipping existing thumbnail: ${video.id}.jpg`);
      continue;
    }

    console.log(`🎯 Generating thumbnail for: ${video.id}`);
    await createThumbnail(video.url, outputPath);
  }

  console.log("✅ All videos processed.");
}

extractAllVideos().catch((err) => {
  console.error("❌ Unhandled error:", err);
});