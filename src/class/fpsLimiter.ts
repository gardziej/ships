import App from "../app";

export default class FpsLimiter {

  private times: number[] = [];
  private fps: number;

  then = performance.now();
  interval = 1000 / 60;
  tolerance = 0.1;

  constructor(private app: App) {
    this.loop();
  }

  private loop(now: number = 0): void {
    requestAnimationFrame(now => this.loop(now));
    const delta = now - this.then;
    if (delta >= this.interval - this.tolerance) {
      this.then = now - (delta % this.interval);

      this.app.tick();

      while (this.times.length > 0 && this.times[0] <= now - 1000) {
        this.times.shift();
      }
      this.times.push(now);
      this.fps = this.times.length;
    }
  }

}