const canvas = document.getElementById('webgl');
const perf = new PerfMeter();
const {
  vec3,
  mat4
} = glMatrix;

const regl = createREGL({
  canvas
});

const reglCommand = commandOptions =>
  regl({
    ...commandOptions,
    viewport: {
      x: 0,
      y: 0,
      width: canvas.width,
      height: canvas.height,
    },
  });

const cubePositions = [
  [-0.5, +0.5, +0.5],
  [+0.5, +0.5, +0.5],
  [+0.5, -0.5, +0.5],
  [-0.5, -0.5, +0.5], // positive z face.
  [+0.5, +0.5, +0.5],
  [+0.5, +0.5, -0.5],
  [+0.5, -0.5, -0.5],
  [+0.5, -0.5, +0.5], // positive x face
  [+0.5, +0.5, -0.5],
  [-0.5, +0.5, -0.5],
  [-0.5, -0.5, -0.5],
  [+0.5, -0.5, -0.5], // negative z face
  [-0.5, +0.5, -0.5],
  [-0.5, +0.5, +0.5],
  [-0.5, -0.5, +0.5],
  [-0.5, -0.5, -0.5], // negative x face.
  [-0.5, +0.5, -0.5],
  [+0.5, +0.5, -0.5],
  [+0.5, +0.5, +0.5],
  [-0.5, +0.5, +0.5], // top face
  [-0.5, -0.5, -0.5],
  [+0.5, -0.5, -0.5],
  [+0.5, -0.5, +0.5],
  [-0.5, -0.5, +0.5], // bottom face
];

const cubeElements = regl.elements({
  primitive: 'line strip',
  data: [
    [2, 1, 0],
    [2, 0, 3], // positive z face.
    [6, 5, 4],
    [6, 4, 7], // positive x face.
    [10, 9, 8],
    [10, 8, 11], // negative z face.
    [14, 13, 12],
    [14, 12, 15], // negative x face.
    [18, 17, 16],
    [18, 16, 19], // top face.
    [20, 21, 22],
    [23, 20, 22], // bottom face
  ],
});

const drawCube = reglCommand({
  frag: `
  precision mediump float;
  void main() {
    gl_FragColor = vec4(1, 1, 1, 1);
  }`,

  vert: `
  precision mediump float;
  attribute vec3 position;
  uniform mat4 projection, view, model;
  void main() {
    mat4 scale = mat4(mat3(1));
    gl_Position = projection * view * scale * model * vec4(position, 1);
  }
  `,
  attributes: {
    position: cubePositions,
  },
  elements: cubeElements,
  uniforms: {
    view: () => {
      return mat4.lookAt([], vec3.fromValues(5, -1.5, -2), vec3.fromValues(-3, 0, -10), vec3.fromValues(0, 1, 0));
    },
    model: ({
      tick
    }) => {
      const x = Math.cos(0.025 * tick);
      const y = Math.sin(0.025 * tick);
      const rotation = 2 * Math.PI * (tick * 0.01);
      const rotate = mat4.fromRotation([], rotation / 3, vec3.fromValues(1, 1, 0));
      const translate = mat4.fromTranslation([], vec3.fromValues(x, y, -7));
      return mat4.multiply([], translate, rotate);
    },
    projection: ({
        viewportWidth,
        viewportHeight
      }) =>
      mat4.perspective([1, 0, 0, 0], Math.PI / 4, viewportWidth / viewportHeight, 0.01, 10),
  },
});

regl.frame(() => {
  perf.update();
  regl.clear({
    color: [0, 0, 0, 1],
    depth: 1,
  });
  drawCube();
});