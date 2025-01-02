// src/updateResume.ts
import { chromium, Browser, Page } from "playwright";
import { sendTelegramMessage } from "./notify";

interface Config {
  jobkoreaId: string;
  jobkoreaPwd: string;
  telegramToken: string;
  telegramChatId: string;
}

export async function updateResume(config: Config) {
  const { jobkoreaId, jobkoreaPwd, telegramToken, telegramChatId } = config;
  const browser: Browser = await chromium.launch({ headless: true }); // 개발 중 디버깅을 위해 false로 설정 가능
  const context = await browser.newContext();
  const page: Page = await context.newPage();

  try {
    // 1. 로그인 페이지로 직접 이동
    await page.goto("https://www.jobkorea.co.kr/Login/", {
      waitUntil: "networkidle",
    });
    console.log("로그인 페이지로 이동 완료");

    // 2. 아이디 입력
    await page.waitForSelector(".input-id", { timeout: 10000 });
    await page.fill(".input-id", jobkoreaId);
    console.log("아이디 입력 완료");

    // 3. 비밀번호 입력
    await page.waitForSelector(".input-password", { timeout: 10000 });
    await page.fill(".input-password", jobkoreaPwd);
    console.log("비밀번호 입력 완료");

    // 4. 로그인 버튼 클릭 및 네비게이션 대기
    await Promise.all([
      page.waitForNavigation({ waitUntil: "networkidle" }),
      page.click(".login-button"),
    ]);
    console.log("로그인 버튼 클릭 및 로그인 시도 완료");

    // 5. 로그인 후 팝업 처리 (조건부)
    const popups = context.pages();
    if (popups.length > 1) {
      const popup = popups.find(
        (p) => p.url() !== "https://www.jobkorea.co.kr/Login/"
      );
      if (popup) {
        await popup.waitForSelector('a[href*="나중에 변경"]', {
          timeout: 5000,
        });
        await popup.click('a[href*="나중에 변경"]');
        console.log("팝업 처리 완료");

        // 팝업 내 다이얼로그 처리
        popup.once("dialog", (dialog) => {
          console.log(`Dialog message: ${dialog.message()}`);
          dialog.dismiss().catch(() => {});
        });
      }
    }

    // 6. 마이페이지로 이동
    await page.goto("https://www.jobkorea.co.kr/User/Mypage", {
      waitUntil: "networkidle",
    });
    console.log("마이페이지로 이동 완료");

    // 7. 현재 경력 정보 클릭
    await page.waitForSelector(".status a", { timeout: 10000 });
    const [resumePopup] = await Promise.all([
      page.waitForEvent("popup"),
      page.click(".status a"),
    ]);
    console.log("경력 정보 클릭 완료, 새 탭 열림");

    // 8. 새 탭에서 "오늘날짜로 업데이트" 버튼 클릭
    if (resumePopup) {
      await resumePopup.waitForSelector(".button-update", { timeout: 10000 });
      await resumePopup.click(".button-update");
      console.log('"오늘날짜로 업데이트" 버튼 클릭 완료');

      // 업데이트 완료 대기 (필요 시 추가적인 대기 로직 삽입)
      await resumePopup.waitForTimeout(3000); // 예: 3초 대기
    } else {
      throw new Error("이력서 보기 페이지를 찾을 수 없습니다.");
    }

    // 9. 성공 메시지 전송
    const now = new Date();
    const message = `<blockquote>✅ 이력서 업데이트 완료!\n날짜: ${now.toLocaleDateString()} 시간: ${now.toLocaleTimeString()}</blockquote>`;
    // sendTelegramMessage 함수 호출 시 parse_mode를 HTML로 설정해야 합니다
    await sendTelegramMessage(telegramToken, telegramChatId, message, "HTML");
    console.log("성공 메시지 전송 완료");
  } catch (error: any) {
    // 10. 실패 시 에러 메시지 전송
    const errorMessage = `❌ 이력서 업데이트 실패!\n이유: ${error.message}`;
    await sendTelegramMessage(telegramToken, telegramChatId, errorMessage);
    console.error("에러 발생:", errorMessage);
  } finally {
    await browser.close();
    console.log("브라우저 닫기 완료");
  }
}
