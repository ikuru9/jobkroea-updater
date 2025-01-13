import { Page } from "playwright";
import { URLS, SELECTORS, TIMEOUTS } from "../constants";
import { Logger } from "../utils/logger";
import { AuthenticationError, NavigationError, UpdateError } from "../types";

export class JobKoreaService {
  constructor(private readonly page: Page) {}

  async navigateToLoginPage(): Promise<void> {
    try {
      Logger.info("로그인 페이지로 이동 중...");
      await this.page.goto(URLS.LOGIN, { waitUntil: "networkidle" });
      Logger.success("로그인 페이지로 이동 완료");
    } catch (error) {
      throw new NavigationError("로그인 페이지 이동 실패");
    }
  }

  async login(id: string, password: string): Promise<void> {
    try {
      Logger.info("로그인 시도 중...");
      await this.page.waitForSelector(SELECTORS.LOGIN.ID_INPUT, {
        timeout: TIMEOUTS.ELEMENT,
      });
      await this.page.fill(SELECTORS.LOGIN.ID_INPUT, id);

      await this.page.waitForSelector(SELECTORS.LOGIN.PASSWORD_INPUT, {
        timeout: TIMEOUTS.ELEMENT,
      });
      await this.page.fill(SELECTORS.LOGIN.PASSWORD_INPUT, password);

      await Promise.all([
        this.page.waitForNavigation({ waitUntil: "networkidle" }),
        this.page.click(SELECTORS.LOGIN.LOGIN_BUTTON),
      ]);
      Logger.success("로그인 성공");
    } catch (error) {
      throw new AuthenticationError("로그인 실패");
    }
  }

  async handleLoginPopup(): Promise<void> {
    try {
      Logger.info("로그인 팝업 처리 중...");
      const [popup] = await Promise.all([
        this.page.waitForEvent("popup", { timeout: TIMEOUTS.POPUP }),
      ]);

      if (popup) {
        await popup.waitForSelector('a[href*="나중에 변경"]', {
          timeout: TIMEOUTS.ELEMENT,
        });
        const [dialog] = await Promise.all([
          popup.waitForEvent("dialog", { timeout: TIMEOUTS.POPUP }),
          popup.click('a[href*="나중에 변경"]'),
        ]);
        await dialog.dismiss();
        Logger.success("팝업 처리 완료");
      }
    } catch (error) {
      Logger.warning("팝업이 나타나지 않았거나 처리할 수 없습니다.");
    }
  }

  async navigateToMypage(): Promise<void> {
    try {
      Logger.info("마이페이지로 이동 중...");
      await this.page.goto(URLS.MYPAGE, { waitUntil: "networkidle" });
      Logger.success("마이페이지로 이동 완료");
    } catch (error) {
      throw new NavigationError("마이페이지 이동 실패");
    }
  }

  async updateCareerInfo(): Promise<void> {
    try {
      Logger.info("경력 정보 업데이트 중...");
      await this.page.waitForSelector(SELECTORS.MYPAGE.STATUS_LINK, {
        timeout: TIMEOUTS.ELEMENT,
      });

      const [resumePopup] = await Promise.all([
        this.page.waitForEvent("popup", { timeout: TIMEOUTS.POPUP }),
        this.page.click(SELECTORS.MYPAGE.STATUS_LINK),
      ]);

      if (!resumePopup) {
        throw new UpdateError("이력서 팝업창을 열 수 없습니다.");
      }

      await resumePopup.waitForLoadState();

      resumePopup.on("dialog", async (dialog) => {
        Logger.info(`다이얼로그 메시지: ${dialog.message()}`);
        await dialog.accept();
      });

      await resumePopup.waitForSelector(SELECTORS.MYPAGE.UPDATE_BUTTON, {
        timeout: TIMEOUTS.ELEMENT,
      });
      await resumePopup.click(SELECTORS.MYPAGE.UPDATE_BUTTON);
      await resumePopup.waitForTimeout(TIMEOUTS.UPDATE_DELAY);

      Logger.success("경력 정보 업데이트 완료");
    } catch (error) {
      throw new UpdateError("경력 정보 업데이트 실패");
    }
  }
}
