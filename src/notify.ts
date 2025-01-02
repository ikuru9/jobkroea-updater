// src/notify.ts

export async function sendTelegramMessage(
  token: string,
  chatId: string,
  message: string,
  parseMode: string = "HTML"
) {
  try {
    const response = await fetch(
      `https://api.telegram.org/bot${token}/sendMessage`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: parseMode,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("텔레그램 메시지 전송 실패:", error);
    throw error;
  }
}
