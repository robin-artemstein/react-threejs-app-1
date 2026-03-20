// components/CoffeeModel.jsx
// Loads the coffee GLB model via useGLTF (from Drei).
// For every mesh in the GLB, it also renders a <Decal> for each
// active decal box, projecting the user's chosen image onto the surface.

import { useContext } from "react";
import { useGLTF, Decal, useTexture } from "@react-three/drei";
import { DecalBoxesContext } from "../context/DecalBoxesContext";

// Pre-fetch the GLB so it starts downloading before the component even mounts
useGLTF.preload("./coffee-transformed.glb");

export function CoffeeModel() {
  // Load the GLB. `nodes` = all meshes, `materials` = all PBR materials
  const { nodes, materials } = useGLTF("./coffee-transformed.glb");

  // The live list of decal projectors (boxes) from shared state
  const { decalBoxes } = useContext(DecalBoxesContext);

  return (
    // dispose={null} tells R3F not to auto-dispose the geometry/materials
    // when the component unmounts – important for stable re-renders
    <group dispose={null}>
      {Object.entries(nodes).map(([name, node]) => {
        if (node.type !== "Mesh") return null; // skip cameras, lights, empties

        return (
          <mesh
            key={name}
            geometry={node.geometry}
            material={materials[node.material?.name] ?? node.material}
            castShadow
            receiveShadow
          >
            {/*
              Stamp one decal per active box.
              Each DecalStamp independently loads/caches its own texture.
            */}
            {decalBoxes.map((box) => (
              <DecalStamp key={box.id} box={box} />
            ))}
          </mesh>
        );
      })}
    </group>
  );
}

// ---------------------------------------------------------------------------
// DecalStamp – projects one image onto the parent mesh
// ---------------------------------------------------------------------------
function DecalStamp({ box }) {
  // useTexture fetches + caches the image as a Three.js Texture object.
  // When imageUrl changes (new upload), Three.js automatically loads the new one.
  const texture = useTexture(box.imageUrl);

  return (
    <Decal
      // World-space position of the projector box (synced from TransformControls)
      position={box.position ?? [0, 0, 0]}
      // Euler rotation of the projector box
      rotation={box.rotation ?? [0, 0, 0]}
      // Scale matches the box size so the image covers exactly one face
      scale={box.scale ?? [10, 10, 10]}
      // The actual image texture to stamp
      map={texture}
      // polygonOffset prevents z-fighting (decal flickering through mesh surface)
      polygonOffset
      polygonOffsetFactor={-10}
      // Respect transparency in the image (PNG alpha channel)
      transparent
      depthTest
      // Don't write to depth buffer so multiple decals can overlap cleanly
      depthWrite={false}
    />
  );
}