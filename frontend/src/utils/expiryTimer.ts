/**
 * One-shot timer with a generation ID: starting or cancelling invalidates every earlier timer, so a stale
 * callback can never run (or clear a newer value) even if its underlying timeout were to fire late.
 */
export class ExpiryTimer {
  private readonly delayMs: number;
  private handle: ReturnType<typeof setTimeout> | null = null;
  private generation = 0;

  constructor(delayMs: number) {
    this.delayMs = delayMs;
  }

  /** (Re)starts the countdown; any previous countdown is cancelled. */
  start(onExpire: () => void): void {
    this.cancel();
    const generation = this.generation;
    this.handle = setTimeout(() => {
      if (generation !== this.generation) return;
      this.handle = null;
      onExpire();
    }, this.delayMs);
  }

  cancel(): void {
    this.generation += 1;
    if (this.handle !== null) {
      clearTimeout(this.handle);
      this.handle = null;
    }
  }

  get isRunning(): boolean {
    return this.handle !== null;
  }
}
