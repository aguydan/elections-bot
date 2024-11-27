import puppeteer from 'puppeteer';

export class FrontendUtils {
    public static async getResultsScreenshot(path: string): Promise<Buffer> {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();

        await page.setViewport({ width: 1920, height: 1080 });

        try {
            await page.goto(path, { waitUntil: 'networkidle0' });
            const screenshot = await page.screenshot();

            await page.close();
            await browser.close();

            return Buffer.from(screenshot);
        } catch (error) {
            //in case the frontend is not available
            throw error;
        }
    }
}
