// Import Three.js
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

let scene, camera, renderer;
let raycaster, mouse;
let video, videoTexture, videoMesh;
let controls;
let icons = {};
let isDragging = false;
let dragStart = new THREE.Vector2();

init();
animate();

function init() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x888888);

  camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.z = 5;

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  raycaster = new THREE.Raycaster();
  mouse = new THREE.Vector2();

  video = document.createElement('video');
  video.src = 'Sample Videos/sample4.mp4';
  video.crossOrigin = 'anonymous';
  video.playsInline = true;
  video.loop = true;
  video.muted = false;
  video.preload = 'auto';
  video.load();

  video.addEventListener('loadeddata', () => {
    videoTexture = new THREE.VideoTexture(video);
    videoTexture.minFilter = THREE.LinearFilter;
    videoTexture.magFilter = THREE.LinearFilter;
    videoTexture.format = THREE.RGBAFormat;

    const geometry = new THREE.PlaneGeometry(10, 6);
    const material = new THREE.MeshBasicMaterial({ map: videoTexture, side: THREE.DoubleSide });
    videoMesh = new THREE.Mesh(geometry, material);
    videoMesh.name = 'videoPlane';
    scene.add(videoMesh);

    createIcons();
  });

  window.addEventListener('click', onClick, false);
  window.addEventListener('resize', onWindowResize);
  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);
  window.addEventListener('mousedown', onMouseDown);
  window.addEventListener('mouseup', () => isDragging = false);
  window.addEventListener('mousemove', onMouseMove);
  window.addEventListener('wheel', onMouseWheel);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function onClick(event) {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(scene.children);

  for (let i = 0; i < intersects.length; i++) {
    if (intersects[i].object.name === 'videoPlane') {
      togglePlayPause();
      console.log('Video plane clicked');
    }
  }
}

function onKeyDown(event) {
  if (event.code === 'Space') {
    togglePlayPause();
  } else if (event.code === 'ArrowLeft') {
    video.currentTime = Math.max(0, video.currentTime - 5);
    console.log('Rewind 5 seconds');
    showIcon('rewind');
  } else if (event.code === 'ArrowRight') {
    video.currentTime = Math.min(video.duration, video.currentTime + 5);
    console.log('Forward 5 seconds');
    showIcon('forward');
  }
}

function onKeyUp(event) {
  // No longer using Alt for rotation
}

function onMouseDown(event) {
  isDragging = true;
  dragStart.set(event.clientX, event.clientY);
}

function onMouseMove(event) {
  if (!isDragging || !camera) return;
  const deltaX = (event.clientX - dragStart.x) / window.innerWidth;
  const deltaY = (event.clientY - dragStart.y) / window.innerHeight;

  camera.rotation.y -= deltaX * Math.PI;
  camera.rotation.x -= deltaY * Math.PI;

  dragStart.set(event.clientX, event.clientY);
}

function onMouseWheel(event) {
  if (!camera) return;
  const direction = event.deltaY > 0 ? 1 : -1;
  camera.position.z += direction;
}

function togglePlayPause() {
  if (video.paused) {
    video.play();
    console.log('Play');
    showIcon('play');
  } else {
    video.pause();
    console.log('Pause');
    showIcon('pause');
  }
}

function showIcon(name) {
  if (!icons[name]) return;
  icons[name].material.opacity = 0.7;
  setTimeout(() => {
    if (icons[name]) icons[name].material.opacity = 0;
  }, 500);
}

function createIcons() {
  const iconColor = 0x333333;
  const iconData = [
    { name: 'play', shapes: createPlayIconShape(), color: iconColor, x: 0 },
    { name: 'pause', shapes: createPauseIconShape(), color: iconColor, x: 0 },
    { name: 'rewind', shapes: createRewindIconShape(), color: iconColor, x: -3 },
    { name: 'forward', shapes: createForwardIconShape(), color: iconColor, x: 3 }
  ];

  iconData.forEach(({ name, shapes, color, x }) => {
    const geometry = new THREE.ShapeGeometry(shapes);
    const material = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0 });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(x, 0, 0.1);
    icons[name] = mesh;
    videoMesh.add(mesh);
  });
}

function createPlayIconShape() {
  const shape = new THREE.Shape();
  shape.moveTo(-0.2, -0.3);
  shape.lineTo(0.4, 0);
  shape.lineTo(-0.2, 0.3);
  shape.lineTo(-0.2, -0.3);
  return [shape];
}

function createPauseIconShape() {
  const bar1 = new THREE.Shape();
  bar1.moveTo(-0.25, -0.3);
  bar1.lineTo(-0.05, -0.3);
  bar1.lineTo(-0.05, 0.3);
  bar1.lineTo(-0.25, 0.3);
  bar1.lineTo(-0.25, -0.3);

  const bar2 = new THREE.Shape();
  bar2.moveTo(0.05, -0.3);
  bar2.lineTo(0.25, -0.3);
  bar2.lineTo(0.25, 0.3);
  bar2.lineTo(0.05, 0.3);
  bar2.lineTo(0.05, -0.3);

  return [bar1, bar2];
}

function createRewindIconShape() {
  const triangle1 = new THREE.Shape();
  triangle1.moveTo(0.1, -0.3);
  triangle1.lineTo(-0.3, 0);
  triangle1.lineTo(0.1, 0.3);
  triangle1.lineTo(0.1, -0.3);

  const triangle2 = new THREE.Shape();
  triangle2.moveTo(0.5, -0.3);
  triangle2.lineTo(0.1, 0);
  triangle2.lineTo(0.5, 0.3);
  triangle2.lineTo(0.5, -0.3);

  return [triangle1, triangle2];
}

function createForwardIconShape() {
  const triangle1 = new THREE.Shape();
  triangle1.moveTo(-0.1, -0.3);
  triangle1.lineTo(0.3, 0);
  triangle1.lineTo(-0.1, 0.3);
  triangle1.lineTo(-0.1, -0.3);

  const triangle2 = new THREE.Shape();
  triangle2.moveTo(-0.5, -0.3);
  triangle2.lineTo(-0.1, 0);
  triangle2.lineTo(-0.5, 0.3);
  triangle2.lineTo(-0.5, -0.3);

  return [triangle1, triangle2];
}

function animate() {
  requestAnimationFrame(animate);
  if (videoMesh && camera) {
    videoMesh.lookAt(camera.position);
  }
  renderer.render(scene, camera);
}
