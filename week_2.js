import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

let scene, camera, renderer;
let raycaster, mouse;
let video, videoTexture, videoMesh;
let controls;
let icons = {};
let isAltPressed = false;
let isDragging = false;
let dragStart = new THREE.Vector2();
let targetRotation = new THREE.Euler();

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
  const intersects = raycaster.intersectObjects(scene.children, true);

  for (let i = 0; i < intersects.length; i++) {
    if (intersects[i].object.name === 'videoPlane') {
      togglePlayPause();
      console.log('Video plane clicked');
    }
  }
}

function onKeyDown(event) {
  if (event.code === 'AltLeft') isAltPressed = true;

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
  if (event.code === 'AltLeft') isAltPressed = false;
}

function onMouseDown(event) {
  isDragging = true;
  dragStart.set(event.clientX, event.clientY);
}

function onMouseMove(event) {
  if (!isDragging || !videoMesh) return;
  const deltaX = (event.clientX - dragStart.x) / window.innerWidth;
  const deltaY = (event.clientY - dragStart.y) / window.innerHeight;

  if (isAltPressed) {
    targetRotation.y += deltaX * Math.PI;
    targetRotation.x += deltaY * Math.PI;
    console.log(`Rotation -> X: ${targetRotation.x.toFixed(2)}, Y: ${targetRotation.y.toFixed(2)}`);
  } else {
    videoMesh.position.x += deltaX * 10;
    videoMesh.position.y -= deltaY * 10;
    console.log(`Position -> X: ${videoMesh.position.x.toFixed(2)}, Y: ${videoMesh.position.y.toFixed(2)}`);
  }
  dragStart.set(event.clientX, event.clientY);
}

function onMouseWheel(event) {
  if (!videoMesh) return;
  const scaleFactor = 1 + (event.deltaY > 0 ? -0.1 : 0.1);
  videoMesh.scale.multiplyScalar(scaleFactor);
  console.log(`Scale -> X: ${videoMesh.scale.x.toFixed(2)}, Y: ${videoMesh.scale.y.toFixed(2)}, Z: ${videoMesh.scale.z.toFixed(2)}`);
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
  icons[name].traverse(child => {
    if (child.material) child.material.opacity = 0.7;
  });
  setTimeout(() => {
    if (icons[name]) {
      icons[name].traverse(child => {
        if (child.material) child.material.opacity = 0;
      });
    }
  }, 500);
}

function createIcons() {
  const iconColor = 0x333333;
  const iconData = [
    { name: 'play', shapes: createPlayIconShape(), x: 0 },
    { name: 'pause', shapes: createPauseIconShape(), x: 0 },
    { name: 'rewind', shapes: createRewindIconShape(), x: -3 },
    { name: 'forward', shapes: createForwardIconShape(), x: 3 }
  ];

  iconData.forEach(({ name, shapes, x }) => {
    const group = new THREE.Group();
    shapes.forEach(shape => {
      const geometry = new THREE.ShapeGeometry(shape);
      const material = new THREE.MeshBasicMaterial({ color: iconColor, transparent: true, opacity: 0 });
      const mesh = new THREE.Mesh(geometry, material);
      group.add(mesh);
    });
    group.position.set(x, 0, 0.1);
    icons[name] = group;
    videoMesh.add(group);
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
  const left = new THREE.Shape();
  left.moveTo(-0.25, -0.3);
  left.lineTo(-0.05, -0.3);
  left.lineTo(-0.05, 0.3);
  left.lineTo(-0.25, 0.3);
  left.lineTo(-0.25, -0.3);

  const right = new THREE.Shape();
  right.moveTo(0.05, -0.3);
  right.lineTo(0.25, -0.3);
  right.lineTo(0.25, 0.3);
  right.lineTo(0.05, 0.3);
  right.lineTo(0.05, -0.3);

  return [left, right];
}

function createRewindIconShape() {
  const left = new THREE.Shape();
  left.moveTo(0.1, -0.3);
  left.lineTo(-0.3, 0);
  left.lineTo(0.1, 0.3);
  left.lineTo(0.1, -0.3);

  const right = new THREE.Shape();
  right.moveTo(0.5, -0.3);
  right.lineTo(0.1, 0);
  right.lineTo(0.5, 0.3);
  right.lineTo(0.5, -0.3);

  return [left, right];
}

function createForwardIconShape() {
  const right = new THREE.Shape();
  right.moveTo(-0.1, -0.3);
  right.lineTo(0.3, 0);
  right.lineTo(-0.1, 0.3);
  right.lineTo(-0.1, -0.3);

  const left = new THREE.Shape();
  left.moveTo(-0.5, -0.3);
  left.lineTo(-0.1, 0);
  left.lineTo(-0.5, 0.3);
  left.lineTo(-0.5, -0.3);

  return [right, left];
}

function animate() {
  requestAnimationFrame(animate);
  if (videoMesh) videoMesh.rotation.copy(targetRotation);
  renderer.render(scene, camera);
}
