const aspectRatio = window.innerWidth / window.innerHeight;
const cameraWidth = 960;
const cameraHeight = cameraWidth / aspectRatio;
var tick = 0
var children, WindScreen, chassis, DoorFR, DoorFL, DoorBR, DoorBL, Trunk, SideWindowR, SideWindowL, RearWindow, DoorWindowR, DoorWindowL, WheelFrontR, WheelRearR, WheelFrontL, WheelRearL, LightFront, LightRear, pivotFL, pivotFR, pivotR, box, speed;

const bloomLayer = new THREE.Layers();
bloomLayer.set(1);
const params = {
  exposure: 1,
  bloomStrength: 5,
  bloomThreshold: 0,
  bloomRadius: 0,
  scene: "Scene with Glow"
};

//cubemap
const path = '../textures/cube/';
const format = '.jpg';
const urls = [
  path + 'px' + format, path + 'nx' + format,
  path + 'py' + format, path + 'ny' + format,
  path + 'pz' + format, path + 'nz' + format
];

const reflectionCube = new THREE.CubeTextureLoader().load(urls);
const refractionCube = new THREE.CubeTextureLoader().load(urls);
refractionCube.mapping = THREE.CubeRefractionMapping;

const glassMaterial = new THREE.MeshPhongMaterial({
  color: 0x000000,
  envMap: refractionCube,
  combine: THREE.MixOperation,
  refractionRatio: 0.6
});

const chassisMaterial = new THREE.MeshLambertMaterial({
  color: 0xff6600,
  envMap: reflectionCube,
  combine: THREE.MixOperation,
  reflectivity: 0.1
});

const lightFrontMaterial = new THREE.MeshLambertMaterial({
  color: 0xffffff,
});

const camera = new THREE.PerspectiveCamera(
  75, // vertical field of view
  window.innerWidth / window.innerHeight, // aspect ratio
  0.01, // near plane
  1000 // far plane
);
camera.position.z = 2;
camera.position.y = 2;
camera.position.x = 2;

const scene = new THREE.Scene();
scene.background = reflectionCube;


// Set up lights
const ambientLight = new THREE.AmbientLight(0xffffff);
scene.add(ambientLight);
const light_01 = new THREE.DirectionalLight(0x4287f5, 1);
light_01.position.set(1, 2, -1);
light_01.castShadow = true;
light_01.shadow.mapSize.width = 1024;
light_01.shadow.mapSize.height = 1024;
// const light_01_helper = new THREE.DirectionalLightHelper(light_01, 1);
scene.add(light_01);
// scene.add(light_01_helper);
const light_02 = new THREE.DirectionalLight(0xb942f5, 1);
light_02.position.set(-1, 2, -1);
light_02.castShadow = true;
light_02.shadow.mapSize.width = 1024;
light_02.shadow.mapSize.height = 1024;
// const light_02_helper = new THREE.DirectionalLightHelper(light_02, 1);
scene.add(light_02);
// scene.add(light_02_helper);
const light_03 = new THREE.DirectionalLight(0xffffff, 1);
light_03.position.set(0, 2, 2);
light_03.castShadow = true;
light_03.shadow.mapSize.width = 1024;
light_03.shadow.mapSize.height = 1024;
// const light_03_helper = new THREE.DirectionalLightHelper(light_03, 1);
scene.add(light_03);
// scene.add(light_03_helper);

// var gridGround = new THREE.GridHelper(100, 30, 0x3f3f3f, 0x3f3f3f);
// scene.add(gridGround);

// Plane
let pg = new THREE.PlaneGeometry(100, 100);
pg.rotateX(Math.PI * -0.5);
let pm = new THREE.MeshLambertMaterial({ color: 0x0a0a0a });
let p = new THREE.Mesh(pg, pm);
p.castShadow = true;
p.receiveShadow = true;
scene.add(p);

const renderer = new THREE.WebGLRenderer({
  // alpha: true,
  antialias: true,
  powerPreference: "high-performance"
});
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowMap;
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.minPolarAngle = 0; // radians
controls.maxPolarAngle = toRadians(80);
controls.minDistance = 1;
controls.maxDistance = 5;

const loader = new THREE.GLTFLoader();
loader.load(
  // resource URL
  './vinfast1.glb',
  // called when the resource is loaded
  function(gltf) {
    children = gltf.scene.children;
    for (var i = 0; i < children.length; i++) {
      // console.log(children[i].name);
      if (children[i].name == 'WheelFrontR') WheelFrontR = children[i];
      if (children[i].name == 'WheelFrontL') WheelFrontL = children[i];
      if (children[i].name == 'WheelBack') WheelBack = children[i];
      if (children[i].name == 'WindowFront') WindScreen = children[i];
      if (children[i].name == 'WindowBack') RearWindow = children[i];
      if (children[i].name == 'DoorFrontL') DoorFL = children[i];
      if (children[i].name == 'DoorFrontR') DoorFR = children[i];
      if (children[i].name == 'DoorBackL') DoorBL = children[i];
      if (children[i].name == 'DoorBackR') DoorBR = children[i];
      if (children[i].name == 'Trunk') Trunk = children[i];
    }
    WindScreen.material = glassMaterial;
    RearWindow.material = glassMaterial;

    WheelFrontL.position.set(0, 0, 0);
    pivotFL = new THREE.Group();
    pivotFL.position.set(0.49096575379371643, 0.18856215476989746, 0.9356400370597839);
    scene.add(pivotFL);
    pivotFL.add(WheelFrontL);

    WheelFrontR.position.set(0, 0, 0);
    pivotFR = new THREE.Group();
    pivotFR.position.set(-0.4719744026660919, 0.18856215476989746, 0.9356400370597839);
    scene.add(pivotFR);
    pivotFR.add(WheelFrontR);

    gltf.scene.castShadow = true;
    gltf.scene.recieveShadow = true;
    scene.add(gltf.scene);
    // gltf.animations; // Array<THREE.AnimationClip>
    // gltf.scene; // THREE.Group
    // gltf.scenes; // Array<THREE.Group>
    // gltf.cameras; // Array<THREE.Camera>
    // gltf.asset; // Object
    animate();
  },
  function(xhr) {
    console.log((xhr.loaded / xhr.total * 100) + '% loaded');
  },
  function(error) {
    console.log('An error happened', error);
  }
);

const animate = function() {
  requestAnimationFrame(animate);

  if (speed) {
    WheelFrontL.rotation.x += speed;
    WheelFrontR.rotation.x += speed;
    WheelBack.rotation.x += speed;
  }

  renderer.render(scene, camera);
  controls.update();
};

const render = function() {
  renderer.render(scene, camera);
}

// Order of keys: left, up, right, down, enter, shift.
var keysDown = [0, 0, 0, 0, 0, 0];
document.addEventListener('keydown', function(e) {
  var keyCode = e.keyCode - 37;
  keysDown[keyCode] = 1;
  if (e.keyCode == 13) {
    if (!keysDown[4]) keysDown[4] = 1;
    else keysDown[4] = 0;
  }
  if (e.keyCode == 16) {
    if (!keysDown[5]) keysDown[5] = 1;
    else keysDown[5] = 0;
  }
  logKey(e)
});
document.addEventListener('keyup', function(e) {
  var keyCode = e.keyCode - 37;
  keysDown[keyCode] = 0;
  logKey(e)
});

function logKey(e) {
  console.log(keysDown);
  if (keysDown[4]) {
    gsap.to(DoorFL.rotation, { y: -1, duration: 0.5 });
    gsap.to(DoorFR.rotation, { y: +1, duration: 0.5 });
    gsap.to(DoorBL.rotation, { y: -1, duration: 0.5 });
    gsap.to(DoorBR.rotation, { y: +1, duration: 0.5 });
  } else {
    gsap.to(DoorFL.rotation, { y: 0, duration: 0.5 });
    gsap.to(DoorFR.rotation, { y: 0, duration: 0.5 });
    gsap.to(DoorBL.rotation, { y: 0, duration: 0.5 });
    gsap.to(DoorBR.rotation, { y: 0, duration: 0.5 });
  }
  if (keysDown[5]) {
    gsap.to(Trunk.rotation, { x: +1, duration: 0.5 });
  } else {
    gsap.to(Trunk.rotation, { x: 0, duration: 0.5 });
  }

  speed = 0;
  tick = 0;
  if (keysDown[0]) {
    tick = 0.7;
  } else if (keysDown[2]) {
    tick = -0.7;
  }
  if (keysDown[1]) {
    speed = 0.05;
    // tick = 0;
  } else if (keysDown[3]) {
    speed = -0.05;
    // tick = 0;
  }
  gsap.to(pivotFL.rotation, { y: tick, duration: 0.1 });
  gsap.to(pivotFR.rotation, { y: tick, duration: 0.1 });
  render();
}

// Some math functions.
function toDegrees(angle) {

  return angle * (180 / Math.PI);
}

function toRadians(angle) {

  return angle * (Math.PI / 180);
}

function sinDegree(degrees) {

  return Math.round(Math.sin(toRadians(degrees)) * 1000) / 1000;
}

function cosDegree(degrees) {

  return Math.round(Math.cos(toRadians(degrees)) * 1000) / 1000;
}