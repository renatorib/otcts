export class Cooldown {
  time: number = Date.now();
  timetoout: number = 0;

  timeout(amountInMs: number) {
    this.timetoout = amountInMs;
    this.time = Date.now() + amountInMs;
  }

  timeleft() {
    return Math.min(this.timetoout, Math.max(0, this.time - Date.now()));
  }

  progress() {
    return 1 - this.timeleft() / this.timetoout;
  }

  isExpired() {
    return this.progress() === 1;
  }

  isNotExpired() {
    return this.progress() < 1;
  }
}
