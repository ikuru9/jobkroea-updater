import { Browser, chromium, Page } from "playwright";
import { Logger } from "../utils/logger";

export class BrowserService {
  private browser: Browser | null = null;
  private page: Page | null = null;

  async initialize(): Promise<void> {
    try {
      this.browser = await chromium.launch({ headless: true });
      const context = await this.browser.newContext({
        viewport: { width: 1280, height: 720 },
      });
      this.page = await context.newPage();
      Logger.info("브라우저 초기화 완료");
    } catch (error) {
      Logger.error("브라우저 초기화 실패", error as Error);
      throw error;
    }
  }

  getPage(): Page {
    if (!this.page) {
      throw new Error("브라우저가 초기화되지 않았습니다.");
    }
    return this.page;
  }

  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      this.page = null;
      Logger.info("브라우저 종료 완료");
    }
  }
}
