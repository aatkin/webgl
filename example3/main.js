const canvas = document.getElementById('webgl');
const perf = new PerfMeter();
const {
  vec3,
  mat4
} = glMatrix;

const textureImage = new Image();
textureImage.src = 'public/frontend_logo.png';

const aToRad = (a) => (a * Math.PI) / 180;

window.isAutoplaying = false;
let isDragging = false;
let lastX = 0;
// let startX = 0;
let rotationX = aToRad(0);
let lastY = 0;
// let startY = 0;
let rotationY = aToRad(-15);

const onMouseMove = (evt) => {
  const currentX = evt.screenX;
  const currentY = evt.screenY;

  // x axis rotation
  if (currentX - lastX >= 0) {
    rotationX += Math.abs(aToRad(lastX - currentX) * 0.5);
  } else {
    rotationX -= Math.abs(aToRad(lastX - currentX) * 0.5);
  }

  // y axis rotation
  if (currentY - lastY >= 0) {
    rotationY += Math.abs(aToRad(lastY - currentY) * 0.5);
  } else {
    rotationY -= Math.abs(aToRad(lastY - currentY) * 0.5);
  }

  lastX = currentX;
  lastY = currentY;
};

canvas.addEventListener('mousedown', (ev) => {
  if (!window.isAutoplaying) {
    lastX = ev.screenX;
    lastY = ev.screenY;
    canvas.addEventListener('mousemove', onMouseMove);
  }
});
canvas.addEventListener('mouseup', (ev) => {
  canvas.removeEventListener('mousemove', onMouseMove);
})

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

const cubeElements = regl.elements({
  primitive: 'triangles',
  data: [
    // Front face
    [0, 1, 2],
    [0, 2, 3],
    // Back face
    [4, 5, 6],
    [4, 6, 7],
    // Left face
    [0, 3, 7],
    [0, 7, 4],
    // Right face
    [1, 2, 6],
    [1, 6, 5],
    // Top face
    [0, 1, 5],
    [0, 5, 4],
    // Bottom face
    [2, 3, 7],
    [2, 7, 6]
  ]
})

const cubePositions = (w, h, d) => [
  // Front
  [-w, h, d], // 0
  [w, h, d], // 1
  [w, -h, d], // 2
  [-w, -h, d], // 3
  // Back
  [-w, h, -d], // 4
  [w, h, -d], // 5
  [w, -h, -d], // 6
  [-w, -h, -d] // 7
];

const textureCoordinates = [
  // Front
  0.0, 0.0,
  1.0, 0.0,
  1.0, 1.0,
  0.0, 1.0,
  // Back
  0.0, 0.0,
  1.0, 0.0,
  1.0, 1.0,
  0.0, 1.0,
  // Top
  0.0, 0.0,
  1.0, 0.0,
  1.0, 1.0,
  0.0, 1.0,
  // Bottom
  0.0, 0.0,
  1.0, 0.0,
  1.0, 1.0,
  0.0, 1.0,
  // Right
  0.0, 0.0,
  1.0, 0.0,
  1.0, 1.0,
  0.0, 1.0,
  // Left
  0.0, 0.0,
  1.0, 0.0,
  1.0, 1.0,
  0.0, 1.0,
];

textureImage.onload = () => {

  const drawCube = reglCommand({
    frag: `
    precision mediump float;

    varying vec2 vUv;

    uniform sampler2D texture;

    void main() {
      gl_FragColor = texture2D(texture, vUv);
    }`,

    vert: `
    precision mediump float;

    attribute vec3 position;

    uniform mat4 projection, view, model;

    attribute vec2 uv;
    varying vec2 vUv;

    void main() {
      mat4 scale = mat4(mat3(1.75));
      gl_Position = projection * view * scale * model * vec4(position, 1);
      vUv = uv;
    }
    `,
    attributes: {
      position: cubePositions(0.5, 0.5, 0.5),
      uv: textureCoordinates
    },
    elements: cubeElements,
    uniforms: {
      texture: regl.texture({
        data: textureImage,
        mag: 'linear',
        min: 'linear'
      }),
      view: () => {
        let eye = vec3.fromValues(0, 3, 4);
        let center = vec3.fromValues(0, 0, 0);
        if (window.isAutoplaying) {
          eye = vec3.fromValues(0, 3, 8);
          center = vec3.fromValues(0, 1, 0);
        }
        const upAxis = vec3.fromValues(0, 1, 0);
        return mat4.lookAt([], eye, center, upAxis);
      },
      model: ({
        tick
      }) => {
        if (!window.isAutoplaying) {
          const rotateX = mat4.fromXRotation([], rotationY);
          const rotateY = mat4.fromYRotation([], rotationX);
          const rotate = mat4.multiply([], rotateX, rotateY);
          const translate = mat4.fromTranslation([], vec3.fromValues(0, 0, 0));
          return mat4.multiply([], translate, rotate);
        } else {
          const x = Math.cos(0.03 * tick);
          const y = Math.sin(0.03 * tick);
          const rotation = 2 * Math.PI * (tick * 0.01);
          const rotate = mat4.fromRotation([], rotation / 3, vec3.fromValues(1, 1, 0));
          const translate = mat4.fromTranslation([], vec3.fromValues(x * 2, y * 2, -3));
          return mat4.multiply([], translate, rotate);
        }
      },
      projection: ({
          viewportWidth,
          viewportHeight
        }) =>
        mat4.perspective([1, 0, 0, 0], Math.PI / 4, viewportWidth / viewportHeight, 0.01, 20),
    },
  });

  regl.frame(() => {
    perf.update();
    regl.clear({
      color: [0, 0, 0, 255],
      depth: 1
    });
    drawCube();
  });
}