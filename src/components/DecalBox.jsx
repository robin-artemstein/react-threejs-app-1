// components/DecalBox.jsx
// One wireframe box that acts as a "decal projector".
// When selected it shows a PivotControls gizmo – a single draggable pivot
// handle that lets the user translate, rotate, and scale the box in one place.

import { useRef, useEffect, useContext, useCallback } from "react";
import { PivotControls } from "@react-three/drei";
import { Vector3, Quaternion, Euler, Matrix4 } from "three";
import { DecalBoxesContext } from "../context/DecalBoxesContext";

// Reusable decomposition objects – created once outside the component
// so we're not allocating new objects on every drag frame (performance)
const _position   = new Vector3();
const _quaternion = new Quaternion();
const _scale      = new Vector3();
const _euler      = new Euler();

export function DecalBox({ id, isSelected, onSelect }) {
  const meshRef = useRef();

  // Pull the updater from context so we can push new transform values
  // back to the shared state whenever the pivot gizmo moves
  const { updateBox } = useContext(DecalBoxesContext);

  // -----------------------------------------------------------------------
  // SYNC TRANSFORM → CONTEXT via PivotControls onDrag
  //
  // PivotControls calls onDrag on every animation frame while the user drags.
  // It passes four matrices; we use `worldMatrix` (the 3rd argument) because
  // it gives us the object's transform in world space – the same space that
  // Three.js Decal needs to project the image correctly.
  //
  // We decompose the 4×4 world matrix into:
  //   position  → [x, y, z]
  //   quaternion → converted to Euler [rx, ry, rz]
  //   scale     → [sx, sy, sz]
  // -----------------------------------------------------------------------
  const handleDrag = useCallback(
    (_local, _deltaLocal, world) => {
      // decompose() splits the matrix into its three transform components
      world.decompose(_position, _quaternion, _scale);

      // Convert quaternion → Euler angles so <Decal rotation={...}> can use them
      _euler.setFromQuaternion(_quaternion);

      updateBox(id, {
        position: _position.toArray(),                   // [x, y, z]
        rotation: [_euler.x, _euler.y, _euler.z],        // [rx, ry, rz]
        scale:    _scale.toArray(),                      // [sx, sy, sz]
      });
    },
    [id, updateBox]
  );

  // -----------------------------------------------------------------------
  // SELECT on click – stopPropagation prevents the canvas background from
  // receiving the same click and immediately deselecting
  // -----------------------------------------------------------------------
  const handleClick = useCallback(
    (e) => {
      e.stopPropagation();
      onSelect(id);
    },
    [id, onSelect]
  );

  // -----------------------------------------------------------------------
  // INITIAL SYNC – push the default transform into context on first mount
  // -----------------------------------------------------------------------
  useEffect(() => {
    updateBox(id, {
      position: [0, 0, 0],
      rotation: [0, 0, 0],
      scale:    [0.5, 0.5, 0.5],
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    /*
      PivotControls from Drei renders an all-in-one pivot handle directly on
      the object – no mode-switching needed (unlike TransformControls).

      Key props explained:
        anchor        – [0,0,0] centres the handle on the object origin
        depthTest     – false keeps the handle visible even behind meshes
        lineWidth     – thickness of the gizmo lines in pixels
        axisColors    – classic X=red, Y=green, Z=blue
        scale         – visual size of the gizmo in world units
        visible       – only show the gizmo when this box is selected
        disableScaling– false = scale handles are included
        autoTransform – true (default): PivotControls physically moves its
                        children group; we read back the transform in onDrag
        onDrag        – fires every frame while dragging with the new matrices
    */
    <PivotControls
      anchor={[0, 0, 0]}
      depthTest={false}
      lineWidth={3}
      axisColors={["#ff3d3d", "#4dff4d", "#3d8cff"]}
      scale={0.5}
      visible={isSelected}
      disableScaling={false}
      onDrag={handleDrag}
    >
      {/*
        The wireframe box lives INSIDE PivotControls so the gizmo directly
        moves / rotates / scales it – no need to manually apply matrices.
      */}
      <mesh
        ref={meshRef}
        onClick={handleClick}
      >
        <boxGeometry args={[1, 1, 1]} />
        <meshBasicMaterial
          color={isSelected ? "#00ffff" : "#ffffff"} // cyan tint when selected
          wireframe
          transparent
          opacity={0.8}
        />
      </mesh>
    </PivotControls>
  );
}