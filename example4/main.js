const canvas = document.getElementById('webgl');
const perf = new PerfMeter();

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);

const renderer = new THREE.WebGLRenderer({
  canvas
});
renderer.setSize(canvas.clientWidth, canvas.clientHeight);

const geometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
const material = new THREE.MeshBasicMaterial({
  color: 0xffffff,
  wireframe: true
});
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

camera.position.z = 1;

const animate = function () {
  requestAnimationFrame(animate);
  perf.update();

  cube.rotation.x += 0.01;
  cube.rotation.z += 0.01;

  renderer.render(scene, camera);
};

animate();