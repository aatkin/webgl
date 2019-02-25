const FPS_TICK = 0.5;

class PerfMeter {
  constructor() {
    const header = document.getElementById('header');
    const fpsCounter = document.createElement('div');
    fpsCounter.className = "fps-counter";
    this.fpsCounter = fpsCounter;
    header.appendChild(fpsCounter);
    this.overallTime = performance.now();
    this.fpsTick = FPS_TICK;
  }

  update() {
    const currentTime = performance.now();
    const delta = currentTime - this.overallTime;
    this.overallTime = currentTime;
    const shouldUpdateFps = (currentTime / 1000) / FPS_TICK >= this.fpsTick;
    if (shouldUpdateFps) {
      this.fpsTick += FPS_TICK;
      const fps = Math.floor(1000 / delta);
      const displayMs = delta.toFixed(2);
      this.fpsCounter.innerText = `${fps} FPS - ${displayMs}ms`;
    }
  }
}