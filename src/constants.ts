export const URLS = {
  LOGIN: "https://www.jobkorea.co.kr/Login/",
  MYPAGE: "https://www.jobkorea.co.kr/User/Mypage",
} as const;

export const SELECTORS = {
  LOGIN: {
    ID_INPUT: ".input-id",
    PASSWORD_INPUT: ".input-password",
    LOGIN_BUTTON: ".login-button",
  },
  MYPAGE: {
    STATUS_LINK: ".status a",
    UPDATE_BUTTON: ".button-update",
  },
} as const;

export const TIMEOUTS = {
  NAVIGATION: 20000,
  ELEMENT: 15000,
  POPUP: 10000,
  UPDATE_DELAY: 3000,
} as const;
