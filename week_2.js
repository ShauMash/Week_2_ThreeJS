import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

let scene, camera, renderer;
let raycaster, mouse;
let video, videoTexture, videoMesh;

init();
animate();

function init() {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.z = 5;

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  raycaster = new THREE.Raycaster();
  mouse = new THREE.Vector2();

  // Setup video element
  video = document.createElement('video');
  video.src = 'sample4.mp4'; // make sure it's in same folder
  video.crossOrigin = 'anonymous';
  video.playsInline = true;
  video.loop = true;
  video.muted = false;
  video.preload = 'auto';
  video.load();

  // Wait until video is ready before creating texture
  video.addEventListener('loadeddata', () => {
    console.log("Video can play through");

    // Correct texture format
    videoTexture = new THREE.VideoTexture(video);
    videoTexture.minFilter = THREE.LinearFilter;
    videoTexture.magFilter = THREE.LinearFilter;
    videoTexture.format = THREE.RGBAFormat; // This avoids any WebGL errors

    // Plane geometry: smaller than screen size
    const geometry = new THREE.PlaneGeometry(10, 6);
    const material = new THREE.MeshBasicMaterial({ map: videoTexture, side: THREE.DoubleSide });

    videoMesh = new THREE.Mesh(geometry, material);
    videoMesh.name = "videoPlane";
    scene.add(videoMesh);
  });

  // Click detection
  window.addEventListener('click', onClick, false);

  // Handle resize
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
}

function onClick(event) {
  event.preventDefault();

  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(scene.children);

  for (let i = 0; i < intersects.length; i++) {
    if (intersects[i].object.name === 'videoPlane') {
      if (video.paused) {
        video.play();
        console.log("▶ Video played");
      } else {
        video.pause();
        console.log("⏸ Video paused");
      }
    }
  }
}
window.addEventListener('keydown', (event) => {
  // Spacebar for play/pause
  if (event.code === 'Space') {
    if (video.paused) {
      video.play();
      console.log("▶ Video played via space");
    } else {
      video.pause();
      console.log("⏸ Video paused via space");
    }
  }

  // ArrowLeft to rewind 5 seconds
  if (event.code === 'ArrowLeft') {
    video.currentTime = Math.max(0, video.currentTime - 5);
    console.log("<< Rewind 5 seconds");
  }

  // ArrowRight to fast forward 5 seconds
  if (event.code === 'ArrowRight') {
    video.currentTime = Math.min(video.duration, video.currentTime + 5);
    console.log(">> Fast forward 5 seconds");
  }
});
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
