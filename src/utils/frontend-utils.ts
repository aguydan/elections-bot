import puppeteer from 'puppeteer';

export class FrontendUtils {
    public static async getResultsImage(path: string) {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();

        await page.setViewport({ width: 1920, height: 1080 });
        await page.goto(path, { waitUntil: 'networkidle0' });
        const screenshot = await page.screenshot();

        await page.close();
        await browser.close();

        return Buffer.from(screenshot);
    }
}
