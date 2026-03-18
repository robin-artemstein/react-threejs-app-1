# React + Three.js testing application 1

A WebGL demo built with:

- React
- Vite
- Three.js
- React Three Fiber
- React Three Drei
- Leva UI panel
- TailwindCSS
- Bun

The application loads a GLB model and a draggable decal projector with gizmo.

---

# Push to GitHub repository

git init
git add .
git commit -m "The Nth commit on date."
git remote rm origin
git branch -M main
git@github.com:robin-artemstein/react-threejs-app-1.git
git push -u -f origin main

# Installation

Install Bun first

https://bun.sh

Then install dependencies:

```bash
bun install
bun dev
```

# Project Structure

react-babylon-control
│
├── index.html
├── package.json
├── bun.lockb
├── tailwind.config.js
├── postcss.config.js
├── tsconfig.json
├── vite.config.ts
│
└── src
    │
    ├── main.tsx
    ├── index.css
    │
    ├── App.tsx
    │
    └── components
        │
        └── BabylonContent.tsx