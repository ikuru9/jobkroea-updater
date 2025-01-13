export class Logger {
  private static formatMessage(message: string): string {
    const now = new Date();
    return `[${now.toISOString()}] ${message}`;
  }

  static info(message: string): void {
    console.log(this.formatMessage(message));
  }

  static error(message: string, error?: Error): void {
    console.error(this.formatMessage(message));
    if (error) {
      console.error(error);
    }
  }

  static success(message: string): void {
    console.log(this.formatMessage(`✅ ${message}`));
  }

  static warning(message: string): void {
    console.warn(this.formatMessage(`⚠️ ${message}`));
  }
}
