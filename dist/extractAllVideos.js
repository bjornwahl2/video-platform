import { chromium } from 'playwright';
const VIDEO_PAGE = 'https://video.skynordic.no/videoviewer/vd4.aspx?station=Osfossen';
export async function extractAllVideos() {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(VIDEO_PAGE, { timeout: 60000 });
    await page.waitForSelector('select#DropDownList1 option');
    const options = await page.$$('select#DropDownList1 option');
    const videos = [];
    for (const option of options) {
        const value = await option.getAttribute('value');
        const title = await option.innerText();
        if (!value || !value.endsWith('.mp4'))
            continue;
        const id = value.split('\\').pop()?.replace('.mp4', '') ?? '';
        const videoUrl = `https://video.skynordic.no/FileHandler.ashx?file=${encodeURIComponent(value)}`;
        videos.push({
            id,
            title,
            videoUrl,
            thumbnail: `thumbnails/${id}.jpg`,
            timestamp: new Date().toISOString(), // or use actual timestamp if available
            duration: "00:00" // use actual duration if available
        });
        await browser.close();
        return videos;
    }
    return videos;
}
