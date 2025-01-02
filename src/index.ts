// src/index.ts
import { updateResume } from "./updateResume";
import dotenv from "dotenv";

dotenv.config();

async function main() {
  const config = {
    jobkoreaId: process.env.JOBKOREA_ID || "",
    jobkoreaPwd: process.env.JOBKOREA_PWD || "",
    telegramToken: process.env.TELEGRAM_BOT_TOKEN || "",
    telegramChatId: process.env.TELEGRAM_CHAT_ID || "",
  };

  if (
    !config.jobkoreaId ||
    !config.jobkoreaPwd ||
    !config.telegramToken ||
    !config.telegramChatId
  ) {
    console.error("필수 환경 변수가 설정되지 않았습니다.");
    process.exit(1);
  }

  await updateResume(config);
}

main();
