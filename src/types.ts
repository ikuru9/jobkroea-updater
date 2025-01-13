export interface Config {
  jobkoreaId: string;
  jobkoreaPwd: string;
  telegramToken: string;
  telegramChatId: string;
}

export class JobKoreaError extends Error {
  constructor(message: string, public readonly code?: string) {
    super(message);
    this.name = "JobKoreaError";
  }
}

export class AuthenticationError extends JobKoreaError {
  constructor(message: string) {
    super(message, "AUTH_ERROR");
    this.name = "AuthenticationError";
  }
}

export class NavigationError extends JobKoreaError {
  constructor(message: string) {
    super(message, "NAVIGATION_ERROR");
    this.name = "NavigationError";
  }
}

export class UpdateError extends JobKoreaError {
  constructor(message: string) {
    super(message, "UPDATE_ERROR");
    this.name = "UpdateError";
  }
}
