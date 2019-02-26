const canvas = document.getElementById("webgl")
const perf = new PerfMeter();

const regl = createREGL({
  canvas
});

const reglCommand = (commandOptions) => regl({
  ...commandOptions,
  viewport: {
    x: 0,
    y: 0,
    width: canvas.width,
    height: canvas.height
  }
});

const drawTriangle = reglCommand({
  frag: `
  void main() {
    gl_FragColor = vec4(1, 0, 0, 1);
  }`,

  vert: `
  attribute vec2 position;
  void main() {
    gl_Position = vec4(position, 0, 1);
  }`,

  attributes: {
    position: [
      [-0.5, -0.5],
      [0.5, -0.5],
      [0, 0.5]
    ]
  },

  count: 3
});

regl.frame(() => {
  perf.update();
  regl.clear({
    color: [0, 0, 0, 1]
  });
  drawTriangle();
});