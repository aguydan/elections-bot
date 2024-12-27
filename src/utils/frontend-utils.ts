import puppeteer from 'puppeteer';

export class FrontendUtils {
    public static async getResultsImage(path: string): Promise<Buffer | null> {
        let browser;
        let page;

        try {
            browser = await puppeteer.launch();
            page = await browser.newPage();
        } catch (error) {
            console.error('Initialization error: ' + error);

            return null;
        }

        try {
            await page.setViewport({ width: 1920, height: 1080 });

            await page.goto(path, { waitUntil: 'networkidle0' });

            const handle = await page.$('#screenshotable');
            if (!handle) {
                throw new Error('No element containing the results was found');
            }

            const screenshot = await handle.screenshot();

            return Buffer.from(screenshot);
        } catch (error) {
            console.error('Error while trying to take a screenshot: ' + error);

            return null;
        } finally {
            await page.close();
            await browser.close();
        }
    }
}
