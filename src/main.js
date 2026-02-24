import './style.css'

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

// Scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xf0f0f0);

// Camera (starting position needs to be fixed later)
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(0, 0, 100);

// Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;


// Raycaster for interactivity
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let currentModel; // store reference to model


// Geometry (body map)
const loader = new GLTFLoader();

loader.load('/BodyMaleTemplate.glb', (gltf) => {
  currentModel = gltf.scene;
  scene.add(currentModel);
});


// Lighting (will need to be improved later)
const cameraLight = new THREE.DirectionalLight(0xffffff, 1.2);
camera.add(cameraLight);
scene.add(camera);

scene.add(new THREE.AmbientLight(0xffffff, 0.8));

// Event listener for clicks & raycasting math (raycasting currently NOT working correctly)
window.addEventListener('click', (event) => {

  const rect = renderer.domElement.getBoundingClientRect();

  mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;


  raycaster.setFromCamera(mouse, camera);

  if (!currentModel) return;

  const intersects = raycaster.intersectObjects(currentModel.children, true);

  if (intersects.length > 0) {
    const clicked = intersects[0].object;
    console.log("Clicked:", clicked.name);
    //showMuscleInfo(clicked.name); // function to be added later to display muscle info
  } else{
    console.log("Clicked outside the model");
  }

});


// Animation loop
function animate() {
  requestAnimationFrame(animate);
  controls.update();

  //cube.rotation.x += 0.01;
  //cube.rotation.y += 0.01;
  renderer.render(scene, camera);
}

animate();
