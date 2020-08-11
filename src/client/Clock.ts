export class Clock {
  started: number = Date.now();

  reset() {
    this.started = Date.now();
  }

  elapsed() {
    return Date.now() - this.started;
  }
}
