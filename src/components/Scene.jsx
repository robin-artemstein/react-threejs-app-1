// components/Scene.jsx
// The 3D world: lights, the loaded coffee GLB, and every decal-projector box.
// Reads the box list from shared context.

import { Suspense, useContext } from "react";
import { DecalBoxesContext } from "../context/DecalBoxesContext";
import { CoffeeModel } from "./CoffeeModel";
import { DecalBox } from "./DecalBox";

export function Scene({ selectedId, onSelect }) {
  const { decalBoxes } = useContext(DecalBoxesContext);

  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 8, 5]} intensity={1.2} castShadow />

      <Suspense fallback={null}>
        {/* Coffee mug – decals are projected onto its mesh surfaces */}
        <CoffeeModel />

        {/* One wireframe DecalBox per entry in the shared list */}
        {decalBoxes.map((box) => (
          <DecalBox
            key={box.id}
            id={box.id}
            isSelected={box.id === selectedId}
            onSelect={onSelect}
          />
        ))}
      </Suspense>
    </>
  );
}