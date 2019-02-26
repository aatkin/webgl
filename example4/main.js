const canvas = document.getElementById('webgl');
const button = document.getElementById('toggle');
let toggled = false;
const perf = new PerfMeter();

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);

const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true
});
renderer.setSize(canvas.clientWidth, canvas.clientHeight);
renderer.gammaInput = true;
renderer.gammaOutput = true;
renderer.autoClear = false;

const textureLoader = new THREE.TextureLoader();
const maxAnisotropy = renderer.capabilities.getMaxAnisotropy();
textureLoader.load("public/frontend_logo.png", (texture) => {
  const textureMaterial = new THREE.MeshPhongMaterial({
    map: texture,
    shininess: 5
  });
  texture.anisotropy = maxAnisotropy;
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(3, 3);

  const wireframeGeometry = new THREE.SphereGeometry(3, 32, 32);
  const wireframeMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true });
  const wireframeSphere = new THREE.Mesh(wireframeGeometry, wireframeMaterial);
  wireframeSphere.position.set(0, 0, 0);
  scene.add(wireframeSphere);
  
  const geometry = new THREE.SphereGeometry(3, 32, 32);
  const texturedSphere = new THREE.Mesh(geometry, textureMaterial);
  texturedSphere.position.set(0, 0, 0);

  const light = new THREE.PointLight( 0xFFFFFF, 3.0 );
  light.position.set(0, 0, -7);
  scene.add(light);
  
  camera.position.z = -7;
  camera.lookAt(0, 0, 0);

  button.addEventListener('click', () => {
    if (toggled) {
      scene.remove(texturedSphere);
      scene.add(wireframeSphere);
    } else {
      scene.remove(wireframeSphere);
      scene.add(texturedSphere);
    }
    toggled = !toggled;
  });
  
  const animate = function () {
    requestAnimationFrame(animate);
    perf.update();
  
    texturedSphere.rotation.x += 0.01;
    texturedSphere.rotation.z += 0.01;
    wireframeSphere.rotation.x += 0.01;
    wireframeSphere.rotation.z += 0.01;
  
    renderer.render(scene, camera);
  };
  
  animate();
});