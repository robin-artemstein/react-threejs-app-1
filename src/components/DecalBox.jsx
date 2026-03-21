// components/DecalBox.jsx
// One wireframe box that acts as a "decal projector".
// When selected it shows a PivotControls gizmo – a single draggable pivot
// handle that lets the user translate, rotate, and scale the box in one place.
// Respects the global projectorVisible flag from context to hide/show all boxes.

import { useRef, useEffect, useContext, useCallback } from "react";
import { PivotControls } from "@react-three/drei";
import { Vector3, Quaternion, Euler } from "three";
import { DecalBoxesContext } from "../context/DecalBoxesContext";

// Reusable decomposition objects – created once outside the component
// so we're not allocating new objects on every drag frame (performance)
const _position   = new Vector3();
const _quaternion = new Quaternion();
const _scale      = new Vector3();
const _euler      = new Euler();

export function DecalBox({ id, isSelected, onSelect }) {
  const meshRef = useRef();

  // Pull the updater AND the global visibility flag from context
  const { updateBox, projectorVisible } = useContext(DecalBoxesContext);

  // -----------------------------------------------------------------------
  // SYNC TRANSFORM → CONTEXT via PivotControls onDrag
  //
  // PivotControls calls onDrag on every animation frame while the user drags.
  // It passes four matrices; we use `world` (the 3rd argument) because
  // it gives us the object's transform in world space – the same space that
  // Three.js Decal needs to project the image correctly.
  //
  // We decompose the 4×4 world matrix into:
  //   position   → [x, y, z]
  //   quaternion → converted to Euler [rx, ry, rz]
  //   scale      → [sx, sy, sz]
  // -----------------------------------------------------------------------
  const handleDrag = useCallback(
    (_local, _deltaLocal, world) => {
      // decompose() splits the matrix into its three transform components
      world.decompose(_position, _quaternion, _scale);

      // Convert quaternion → Euler angles so <Decal rotation={...}> can use them
      _euler.setFromQuaternion(_quaternion);

      updateBox(id, {
        position: _position.toArray(),                // [x, y, z]
        rotation: [_euler.x, _euler.y, _euler.z],     // [rx, ry, rz]
        scale:    _scale.toArray(),                   // [sx, sy, sz]
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
      scale:    [1, 1, 1],
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
        visible       – show the GIZMO only when this box is selected AND
                        projectors are globally visible. When projectors are
                        hidden we also hide the gizmo so the scene is clean.
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
      // Hide the gizmo if either: box is not selected, OR all projectors
      // have been hidden via the "Hide projector" button
      visible={isSelected && projectorVisible}
      disableScaling={false}
      onDrag={handleDrag}
    >
      {/*
        The wireframe box lives INSIDE PivotControls so the gizmo directly
        moves / rotates / scales it.

        `visible` on the mesh controls whether the wireframe cube is drawn.
        Setting it to false hides the mesh but keeps the Three.js object
        alive in the scene graph, so transforms and decals are preserved –
        the user can un-hide and continue editing from where they left off.
      */}
      <mesh
        ref={meshRef}
        onClick={handleClick}
        visible={projectorVisible} // hide/show the wireframe cube globally
      >
        <boxGeometry args={[1, 1, 1]} />
        <meshBasicMaterial
          color={isSelected ? "#f5a4a4" : "#ffffff"} // cyan tint when selected
          wireframe
          transparent
          opacity={0.8}
        />
      </mesh>
    </PivotControls>
  );
}