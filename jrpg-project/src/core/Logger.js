const LEVELS = { debug: 0, info: 1, warn: 2, error: 3 };

/**
 * Minimal logger. Level can be changed at runtime.
 */
export class Logger {
  /**
   * @param {string} [namespace='JRPG']
   * @param {'debug'|'info'|'warn'|'error'} [level='info']
   */
  constructor(namespace = 'JRPG', level = 'info') {
    this.namespace = namespace;
    this.level = level;
  }

  _should(level) {
    return LEVELS[level] >= LEVELS[this.level];
  }

  debug(...args) {
    if (this._should('debug')) console.debug(`[${this.namespace}]`, ...args);
  }

  info(...args) {
    if (this._should('info')) console.info(`[${this.namespace}]`, ...args);
  }

  warn(...args) {
    if (this._should('warn')) console.warn(`[${this.namespace}]`, ...args);
  }

  error(...args) {
    if (this._should('error')) console.error(`[${this.namespace}]`, ...args);
  }
}

export const log = new Logger();
