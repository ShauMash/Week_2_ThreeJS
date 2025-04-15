// Import Three.js
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.1/build/three.module.js';

// Setup scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x303030); // Dark grey background

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 0, 5); // Initial camera position

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Video
const video = document.createElement('video');
video.src = 'Sample Videos/sample4.mp4';
video.crossOrigin = 'anonymous';
video.loop = true;
video.playsInline = true;
video.muted = false;
video.load();

const texture = new THREE.VideoTexture(video);
const geometry = new THREE.PlaneGeometry(6.4, 3.6);
const material = new THREE.MeshBasicMaterial({ map: texture });
const videoPlane = new THREE.Mesh(geometry, material);
scene.add(videoPlane);

// Controls
const keys = {};
document.addEventListener('keydown', (e) => keys[e.key.toLowerCase()] = true);
document.addEventListener('keyup', (e) => keys[e.key.toLowerCase()] = false);

// Mouse interaction for icons visibility
let isMouseOverPlane = false;

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

window.addEventListener('mousemove', (event) => {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObject(videoPlane);
  isMouseOverPlane = intersects.length > 0;
});

window.addEventListener('click', (event) => {
  if (isMouseOverPlane) {
    const intersects = raycaster.intersectObjects(iconsGroup.children, true);
    if (intersects.length > 0) {
      const name = intersects[0].object.parent.name || intersects[0].object.name;
      if (name === 'pause') {
        video.pause();
        pauseIcon.visible = false;
        playIcon.visible = true;
      } else if (name === 'play') {
        video.play();
        playIcon.visible = false;
        pauseIcon.visible = true;
      } else if (name === 'rewind') {
        video.currentTime = Math.max(0, video.currentTime - 5);
      } else if (name === 'forward') {
        video.currentTime = Math.min(video.duration, video.currentTime + 5);
      }
    }
  }
});

// Create icons functions
const createIcon = (geometry, color) => {
  const mat = new THREE.MeshBasicMaterial({ color });
  return new THREE.Mesh(geometry, mat);
};

const createPauseIcon = () => {
  const bar1 = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.6, 0.01), new THREE.MeshBasicMaterial({ color: 'grey' }));
  const bar2 = bar1.clone();
  bar1.position.x = -0.15;
  bar2.position.x = 0.15;
  const group = new THREE.Group();
  group.add(bar1, bar2);
  return group;
};

const createPlayIcon = () => {
  const shape = new THREE.Shape();
  shape.moveTo(0, 0.3);
  shape.lineTo(0.5, 0);
  shape.lineTo(0, -0.3);
  shape.lineTo(0, 0.3);
  const geometry = new THREE.ShapeGeometry(shape);
  return createIcon(geometry, 'grey');
};

const createDoubleTriangle = (dir = 1) => {
  const triangle = (xOffset) => {
    const shape = new THREE.Shape();
    shape.moveTo(0, 0.25);
    shape.lineTo(0.4 * dir, 0);
    shape.lineTo(0, -0.25);
    shape.lineTo(0, 0.25);
    const geo = new THREE.ShapeGeometry(shape);
    const mesh = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: 'grey' }));
    mesh.position.x = xOffset;
    return mesh;
  };
  const group = new THREE.Group();
  group.add(triangle(-0.25 * dir), triangle(0.1 * dir));
  return group;
};

// Icons group
const iconsGroup = new THREE.Group();
scene.add(iconsGroup);

// Playback Icons
const pauseIcon = createPauseIcon();
pauseIcon.name = 'pause';
pauseIcon.position.set(0, 0, 0.01);
iconsGroup.add(pauseIcon);

const playIcon = createPlayIcon();
playIcon.name = 'play';
playIcon.position.set(0, 0, 0.01);
playIcon.visible = false;
iconsGroup.add(playIcon);

const rewindIcon = createDoubleTriangle(-1);
rewindIcon.name = 'rewind';
rewindIcon.position.set(-1.5, 0, 0.01);
iconsGroup.add(rewindIcon);

const forwardIcon = createDoubleTriangle(1);
forwardIcon.name = 'forward';
forwardIcon.position.set(1.5, 0, 0.01);
iconsGroup.add(forwardIcon);

videoPlane.add(iconsGroup);

// Spacebar control
document.addEventListener('keydown', (e) => {
  if (e.code === 'Space') {
    e.preventDefault();
    if (video.paused) {
      video.play();
      playIcon.visible = false;
      pauseIcon.visible = true;
    } else {
      video.pause();
      pauseIcon.visible = false;
      playIcon.visible = true;
    }
  }

  // Arrow keys for video control
  if (e.code === 'ArrowLeft') {
    video.currentTime = Math.max(0, video.currentTime - 5);
  } else if (e.code === 'ArrowRight') {
    video.currentTime = Math.min(video.duration, video.currentTime + 5);
  }
});

// Camera movement
const moveSpeed = 0.1;
const moveCamera = () => {
  const dir = new THREE.Vector3();
  camera.getWorldDirection(dir);

  const right = new THREE.Vector3().crossVectors(dir, camera.up).normalize();
  const up = new THREE.Vector3(0, 1, 0);

  if (keys['w']) camera.position.addScaledVector(dir, moveSpeed);  // Forward
  if (keys['s']) camera.position.addScaledVector(dir, -moveSpeed); // Backward
  if (keys['a']) camera.position.addScaledVector(right, -moveSpeed); // Left
  if (keys['d']) camera.position.addScaledVector(right, moveSpeed); // Right
  if (keys['q']) camera.position.addScaledVector(up, -moveSpeed);  // Up
  if (keys['e']) camera.position.addScaledVector(up, moveSpeed);   // Down

  // Ensure the camera stays within the specified range
  camera.position.x = Math.max(-9, Math.min(9, camera.position.x));
  camera.position.y = Math.max(-9, Math.min(9, camera.position.y));
  camera.position.z = Math.max(-9, Math.min(9, camera.position.z));
};

// Animate
function animate() {
  requestAnimationFrame(animate);

  moveCamera();

  // Make plane face the camera
  videoPlane.lookAt(camera.position);

  // Match icons to plane rotation
  iconsGroup.rotation.copy(videoPlane.rotation);

  // Show or hide icons based on mouse position
  iconsGroup.visible = isMouseOverPlane;

  renderer.render(scene, camera);
}

video.addEventListener('loadeddata', () => {
  animate();
});
