import winston from 'winston';
import { Logger as WinstonLogger } from 'winston';

export class Logger {
  private logger: WinstonLogger;

  constructor(private areWarningsIgnored: boolean = true) {
    this.areWarningsIgnored && this.ignoreWarnings();

    this.initialize();
  }

  info(message: string, ...meta: any[]): void {
    this.logger.info(message, ...meta);
  }

  private initialize(): void {
    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.json(),
      transports: [new winston.transports.Console({ format: winston.format.simple() })],
    });
  }

  private ignoreWarnings(): void {
    console.warn = (): undefined => {};
  }
}
