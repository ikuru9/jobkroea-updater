// src/updateResume.ts
import { chromium, Browser, Page, Dialog } from "playwright";
import { sendTelegramMessage } from "./notify";

interface Config {
  jobkoreaId: string;
  jobkoreaPwd: string;
  telegramToken: string;
  telegramChatId: string;
}

export async function updateResume(config: Config) {
  const { jobkoreaId, jobkoreaPwd, telegramToken, telegramChatId } = config;
  const browser: Browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    // recordVideo: { dir: 'videos/' }, // 필요 시 비디오 녹화 활성화
  });
  const page: Page = await context.newPage();

  try {
    // 1. 로그인 페이지로 이동
    await navigateToLoginPage(page);

    // 2. 로그인 수행
    await performLogin(page, jobkoreaId, jobkoreaPwd);

    // 3. 로그인 후 팝업 처리
    await handleLoginPopup(page);

    // 4. 마이페이지로 이동
    await navigateToMypage(page);

    // 5. 경력 정보 업데이트
    await updateCareerInfo(page);

    // 6. 성공 메시지 전송
    await sendSuccessMessage(telegramToken, telegramChatId);
  } catch (error: any) {
    // 실패 시 에러 메시지 전송 및 스크린샷 캡처
    await handleError(page, error, telegramToken, telegramChatId);
  } finally {
    await browser.close();
    console.log("브라우저 닫기 완료");
  }
}

async function navigateToLoginPage(page: Page) {
  console.log("로그인 페이지로 이동 중...");
  await page.goto("https://www.jobkorea.co.kr/Login/", {
    waitUntil: "networkidle",
  });
  console.log("로그인 페이지로 이동 완료");
}

async function performLogin(
  page: Page,
  jobkoreaId: string,
  jobkoreaPwd: string
) {
  console.log("로그인 정보 입력 중...");

  // 아이디 입력
  await page.waitForSelector(".input-id", { timeout: 20000 });
  await page.fill(".input-id", jobkoreaId);
  console.log("아이디 입력 완료");

  // 비밀번호 입력
  await page.waitForSelector(".input-password", { timeout: 20000 });
  await page.fill(".input-password", jobkoreaPwd);
  console.log("비밀번호 입력 완료");

  // 로그인 버튼 클릭 및 네비게이션 대기
  await Promise.all([
    page.waitForNavigation({ waitUntil: "networkidle" }),
    page.click(".login-button"),
  ]);
  console.log("로그인 버튼 클릭 및 로그인 시도 완료");
}

async function handleLoginPopup(page: Page) {
  console.log("로그인 후 팝업 처리 시도 중...");

  try {
    const [popup] = await Promise.all([
      page.waitForEvent("popup", { timeout: 10000 }),
      // 필요 시 팝업을 트리거하는 액션 추가
    ]);
    console.log("팝업이 열렸습니다.");

    // 팝업 내 특정 요소 대기 및 클릭
    await popup.waitForSelector('a[href*="나중에 변경"]', { timeout: 10000 });

    // 다이얼로그 이벤트와 클릭을 동시에 대기
    const [dialog] = await Promise.all([
      popup.waitForEvent("dialog", { timeout: 10000 }),
      popup.click('a[href*="나중에 변경"]'),
    ]);
    console.log(`Popup Dialog message: ${dialog.message()}`);
    await dialog.dismiss();
    console.log("팝업 다이얼로그를 취소했습니다.");
  } catch (error) {
    console.log("팝업이 나타나지 않았습니다. 계속 진행합니다.");
  }
}

async function navigateToMypage(page: Page) {
  console.log("마이페이지로 이동 중...");
  await page.goto("https://www.jobkorea.co.kr/User/Mypage", {
    waitUntil: "networkidle",
  });
  console.log("마이페이지로 이동 완료");
}

async function updateCareerInfo(page: Page) {
  console.log("경력 정보 업데이트 시도 중...");

  // 경력 정보 클릭 및 팝업 대기
  await page.waitForSelector(".status a", { timeout: 15000 });
  const [resumePopup] = await Promise.all([
    page.waitForEvent("popup", { timeout: 10000 }),
    page.click(".status a"),
  ]);

  if (!resumePopup) {
    throw new Error("이력서 팝업창을 열 수 없습니다.");
  }

  await resumePopup.waitForLoadState();
  console.log("경력 정보 클릭 완료, 새 팝업 열림");

  // 다이얼로그 핸들러 설정
  resumePopup.on("dialog", async (dialog) => {
    console.log(`다이얼로그 메시지: ${dialog.message()}`);
    await dialog.accept();
  });

  // 업데이트 버튼 대기 및 클릭
  await resumePopup.waitForSelector(".button-update", { timeout: 10000 });

  try {
    console.log("업데이트 버튼 클릭 시도...");
    await resumePopup.click(".button-update");

    // 다이얼로그 처리 완료 대기
    await resumePopup.waitForTimeout(3000);
    console.log("경력 정보 업데이트 프로세스 완료");
  } catch (error) {
    console.log("버튼 클릭 중 오류 발생:", error);
    throw error;
  }
}

async function sendSuccessMessage(token: string, chatId: string) {
  console.log("성공 메시지 전송 중...");
  const now = new Date();
  const message = `<blockquote>✅ 이력서 업데이트 완료!\n날짜: ${now.toLocaleDateString(
    "ko-KR",
    { timeZone: "Asia/Seoul" }
  )} 시간: ${now.toLocaleTimeString("ko-KR", {
    timeZone: "Asia/Seoul",
  })}</blockquote>`;
  await sendTelegramMessage(token, chatId, message, "HTML");
  console.log("성공 메시지 전송 완료");
}

async function handleError(
  page: Page,
  error: any,
  token: string,
  chatId: string
) {
  console.error("에러 발생:", error.message);

  // 실패 메시지 전송
  const errorMessage = `❌ 이력서 업데이트 실패!\n이유: ${error.message}`;
  await sendTelegramMessage(token, chatId, errorMessage);
  console.log("실패 메시지 전송 완료");

  // 스크린샷 캡처
  // try {
  //   const screenshotPath = `error-${Date.now()}.png`;
  //   await page.screenshot({ path: screenshotPath, fullPage: true });
  //   console.error(`스크린샷 캡처 완료: ${screenshotPath}`);
  // } catch (screenshotError) {
  //   console.error("스크린샷 캡처 실패:", screenshotError);
  // }

  // 프로세스를 비-제로 상태로 종료하여 GitHub Actions에 실패 알림
  process.exit(1);
}
