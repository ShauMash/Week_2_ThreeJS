# 🎥 Three.js Video Playback on Cinematic Plane

This project demonstrates how to render a **cinematic video playback plane** in a 3D scene using [Three.js](https://threejs.org/). The video is mapped onto a 3D plane and can be controlled through **clicks** and **keyboard events** for a seamless interactive experience.

## 🚀 Features

- ✅ Video rendered on a custom-sized 3D plane
- 🖱️ Click on the video plane to toggle play/pause using raycasting
- 🎮 Keyboard controls:
  - `Spacebar`: Toggle play/pause
  - `ArrowRight`: Forward video by 5 seconds
  - `ArrowLeft`: Rewind video by 5 seconds
- Plane can also be rotated using alt+click and moved using left click and scaled using the mouse scroller.
- 🔊 Video plays with **audio** and preserves original resolution
- All the changes made to the plane are detected and logged into the console 
- 🎬 Cinematic plane dimensions (not full screen, gives movie-theater feel)

---

## 🧰 Tech Stack

- [Three.js](https://threejs.org/) - 3D library for rendering
- JavaScript
- WebGL (handled by Three.js)
- HTML5 <video> element


