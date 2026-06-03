// src/config/index.ts
export interface AppConfig {
  // URL 설정
  urls: {
    login: string;
    mypage: string;
  };

  // CSS 셀렉터 설정 (fallback 포함)
  selectors: {
    login: {
      idInput: readonly string[];
      passwordInput: readonly string[];
      loginButton: readonly string[];
    };
    mypage: {
      statusLink: readonly string[];
      updateButton: readonly string[];
    };
  };

  // 타임아웃 설정
  timeouts: {
    navigation: number;
    element: number;
    popup: number;
  };

  // 재시도 설정
  retry: {
    maxOperationRetries: number;
    maxProcessRetries: number;
    baseDelay: number;
    maxDelay: number;
    backoffMultiplier: number;
  };

  // 브라우저 설정
  browser: {
    headless: boolean;
    viewport: {
      width: number;
      height: number;
    };
    args: readonly string[];
    blockResources: {
      ads: boolean;
      analytics: boolean;
      socialMedia: boolean;
      unnecessaryImages: boolean;
    };
  };

  // 로깅 설정
  logging: {
    enableSensitiveDataMasking: boolean;
    logLevel: "error" | "warn" | "info" | "debug";
    includeTimestamp: boolean;
  };

  // 업데이트 검증 설정
  update: {
    successPatterns: readonly string[];
  };

  // 보안 설정
  security: {
    maskSensitiveInfo: boolean;
  };
}

export const defaultConfig: AppConfig = {
  urls: {
    login: "https://www.jobkorea.co.kr/Login/",
    mypage: "https://www.jobkorea.co.kr/User/Mypage",
  },

  selectors: {
    login: {
      idInput: [".input-id", "#user_id", 'input[name="user_id"]', 'input[type="text"]'],
      passwordInput: [
        ".input-password",
        "#user_pwd",
        'input[name="user_pwd"]',
        'input[type="password"]',
      ],
      loginButton: [".login-button", "#login_btn", 'button[type="submit"]', ".btn-login"],
    },
    mypage: {
      statusLink: [".status a", ".my-status a", 'a[href*="status"]', ".resume-status a"],
      updateButton: [
        ".button-update",
        ".btn-update",
        'button[onclick*="update"]',
        ".update-btn",
      ],
    },
  },

  timeouts: {
    navigation: 20000,
    element: 15000,
    popup: 10000,
  },

  retry: {
    maxOperationRetries: 3,
    maxProcessRetries: 3,
    baseDelay: 2000,
    maxDelay: 10000,
    backoffMultiplier: 2,
  },

  browser: {
    headless: true,
    viewport: {
      width: 1280,
      height: 720,
    },
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-accelerated-2d-canvas",
      "--no-first-run",
      "--no-zygote",
      "--disable-gpu",
      "--disable-background-timer-throttling",
      "--disable-backgrounding-occluded-windows",
      "--disable-renderer-backgrounding",
      "--memory-pressure-off",
    ],
    blockResources: {
      ads: true,
      analytics: true,
      socialMedia: true,
      unnecessaryImages: true,
    },
  },

  logging: {
    enableSensitiveDataMasking: true,
    logLevel: "info",
    includeTimestamp: true,
  },

  update: {
    successPatterns: ["업데이트 되었습니다", "업데이트되었습니다", "수정되었습니다"],
  },

  security: {
    maskSensitiveInfo: true,
  },
};

function loadEnvironmentOverrides(baseConfig: AppConfig): AppConfig {
  const config: AppConfig = {
    ...baseConfig,
    urls: { ...baseConfig.urls },
    timeouts: { ...baseConfig.timeouts },
    retry: { ...baseConfig.retry },
    browser: { ...baseConfig.browser },
    logging: { ...baseConfig.logging },
  };

  const readPositiveInt = (name: string): number | undefined => {
    const value = process.env[name];
    if (!value) return undefined;

    const parsed = parseInt(value, 10);
    return !isNaN(parsed) && parsed > 0 ? parsed : undefined;
  };

  const readPositiveFloat = (name: string): number | undefined => {
    const value = process.env[name];
    if (!value) return undefined;

    const parsed = Number(value);
    return !isNaN(parsed) && parsed > 0 ? parsed : undefined;
  };

  if (process.env.JOBKOREA_LOGIN_URL) {
    config.urls.login = process.env.JOBKOREA_LOGIN_URL;
  }

  if (process.env.JOBKOREA_MYPAGE_URL) {
    config.urls.mypage = process.env.JOBKOREA_MYPAGE_URL;
  }

  if (process.env.BROWSER_HEADLESS) {
    config.browser.headless = process.env.BROWSER_HEADLESS === "true";
  }

  const navigationTimeout = readPositiveInt("NAVIGATION_TIMEOUT_MS");
  if (navigationTimeout) {
    config.timeouts.navigation = navigationTimeout;
  }

  const elementTimeout = readPositiveInt("ELEMENT_TIMEOUT_MS");
  if (elementTimeout) {
    config.timeouts.element = elementTimeout;
  }

  const popupTimeout = readPositiveInt("POPUP_TIMEOUT_MS");
  if (popupTimeout) {
    config.timeouts.popup = popupTimeout;
  }

  if (process.env.MAX_RETRIES) {
    const maxRetries = readPositiveInt("MAX_RETRIES");
    if (maxRetries) {
      config.retry.maxOperationRetries = maxRetries;
      config.retry.maxProcessRetries = maxRetries;
    }
  }

  const maxOperationRetries = readPositiveInt("MAX_OPERATION_RETRIES");
  if (maxOperationRetries) {
    config.retry.maxOperationRetries = maxOperationRetries;
  }

  const maxProcessRetries = readPositiveInt("MAX_PROCESS_RETRIES");
  if (maxProcessRetries) {
    config.retry.maxProcessRetries = maxProcessRetries;
  }

  const retryBaseDelay = readPositiveInt("RETRY_BASE_DELAY_MS");
  if (retryBaseDelay) {
    config.retry.baseDelay = retryBaseDelay;
  }

  const retryMaxDelay = readPositiveInt("RETRY_MAX_DELAY_MS");
  if (retryMaxDelay) {
    config.retry.maxDelay = retryMaxDelay;
  }

  const retryBackoffMultiplier = readPositiveFloat("RETRY_BACKOFF_MULTIPLIER");
  if (retryBackoffMultiplier) {
    config.retry.backoffMultiplier = retryBackoffMultiplier;
  }

  if (process.env.LOG_LEVEL && ["error", "warn", "info", "debug"].includes(process.env.LOG_LEVEL)) {
    config.logging.logLevel = process.env.LOG_LEVEL as "error" | "warn" | "info" | "debug";
  }

  return config;
}

const appConfig = loadEnvironmentOverrides(defaultConfig);

export const configManager = {
  getConfig(): AppConfig {
    return appConfig;
  },

  getUrls() {
    return appConfig.urls;
  },

  getSelectors() {
    return appConfig.selectors;
  },

  getTimeouts() {
    return appConfig.timeouts;
  },

  getRetryConfig() {
    return appConfig.retry;
  },

  getBrowserConfig() {
    return appConfig.browser;
  },

  getLoggingConfig() {
    return appConfig.logging;
  },

  getUpdateConfig() {
    return appConfig.update;
  },

  getSecurityConfig() {
    return appConfig.security;
  },
};

export default configManager;
