import {
  createLogger,
  format,
  Logger as WinstonLogger,
  transports,
} from 'winston';

import { LogLevel } from '../models/log-level.type';
const { combine, timestamp, printf, colorize, prettyPrint, simple } = format;

// Stryker disable all

type Meta = object | string | unknown;

export class Logger {
  private logger: WinstonLogger;

  constructor(
    private logLevel: LogLevel = 'info',
    private areWarningsIgnored = true,
  ) {
    if (this.areWarningsIgnored) {
      this.ignoreWarnings();
    }

    this.initialize();
  }

  debug(message: string, ...meta: Meta[]): void {
    this.logger.debug(message, ...meta);
  }

  info(message: string, ...meta: Meta[]): void {
    this.logger.info(message, ...meta);
  }

  warn(message: string, ...meta: Meta[]): void {
    this.logger.warn(message, ...meta);
  }

  error(message: string, ...meta: Meta[]): void {
    this.logger.error(message, ...meta);
  }

  setLogLevel(logLevel: LogLevel = 'info'): void {
    this.logLevel = logLevel;
    this.initialize();
  }

  private initialize(): void {
    this.logger = createLogger({
      level: this.logLevel,
      format: combine(
        timestamp({
          format: 'YYYY-MM-DD HH:MM:SS',
        }),
        prettyPrint(),
        format.splat(),
        simple(),
        printf((msg) => {
          const message = msg.message;
          const splat = msg[Symbol.for('splat')];

          return colorize().colorize(
            msg.level,
            `[${msg.timestamp}] [${msg.level.toLocaleUpperCase()}] - ${message}${
              splat ? ' ' + JSON.stringify(splat) : ''
            }`,
          );
        }),
      ),
      transports: [new transports.Console()],
    });
  }

  private ignoreWarnings(): void {
    console.warn = (): undefined => {
      return;
    };
  }
}
