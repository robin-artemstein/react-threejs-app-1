// App.jsx
// Root of the application.
// - Wraps everything in DecalBoxesProvider (the shared data store)
// - Renders the Leva UI panel and the Three.js Canvas

import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment } from "@react-three/drei";
import { useControls, button, Leva } from "leva";
import { useState, useCallback, useContext } from "react";
import { DecalBoxesProvider, DecalBoxesContext } from "./context/DecalBoxesContext";
import { Scene } from "./components/Scene";

// -------------------------------------------------------------------
// COLOR TOKENS
// Defined once here so they're easy to update in one place.
// -------------------------------------------------------------------
const COLOR_AMBER  = "#b45309"; // dark amber  – New decal, Upload, Hide/Show
const COLOR_RED    = "#b91c1c"; // deep red    – Delete
const COLOR_WHITE  = "#ffffff"; // text color for all buttons

// -------------------------------------------------------------------
// Inner component – safely calls useContext because it lives inside Provider
// -------------------------------------------------------------------
function AppInner() {
  const {
    addBox,
    removeBox,
    updateBox,
    projectorVisible,
    toggleProjectorVisibility,
  } = useContext(DecalBoxesContext);

  // Track which box is currently selected (null = none)
  const [selectedId, setSelectedId] = useState(null);

  // Delete the selected box and clear selection
  const deleteSelected = useCallback(() => {
    if (selectedId === null) return;
    removeBox(selectedId);
    setSelectedId(null);
  }, [selectedId, removeBox]);

  // Open the OS file picker and replace the selected box's image
  const uploadImageForSelected = useCallback(() => {
    if (selectedId === null) return;
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      // Create a temporary browser-local URL for the chosen image file
      const url = URL.createObjectURL(file);
      updateBox(selectedId, { imageUrl: url });
    };
    input.click();
  }, [selectedId, updateBox]);

  // -------------------------------------------------------------------
  // LEVA UI PANEL
  //
  // Button order (top → bottom):
  //   1. "New decal"          – always visible, dark amber
  //   2. "Hide projector" /   – always visible, dark amber
  //      "Show projector"       label swaps based on projectorVisible
  //   3. "Upload an image"    – only when a box is selected, dark amber
  //   4. "Delete"             – only when a box is selected, red
  //
  // Leva's button() second argument is a settings object.
  // { color } sets the button's background color.
  // Leva always renders button text in white regardless of background.
  //
  // useControls re-runs whenever its dependency array changes, which
  // rebuilds the panel so the label and conditional buttons update.
  // -------------------------------------------------------------------
  useControls(
    {
      // ── Always-visible buttons ──────────────────────────────────────

      "New decal": button(
        () => addBox(),
        { color: COLOR_AMBER } // dark amber background
      ),

      // The label is dynamic: we use projectorVisible to pick the string.
      // Because the KEY itself changes ("Hide projector" ↔ "Show projector"),
      // Leva treats it as two different buttons and swaps them automatically
      // when the dependency array updates.
      ...(projectorVisible
        ? {
            "Hide projector": button(
              () => toggleProjectorVisibility(),
              { color: COLOR_AMBER }
            ),
          }
        : {
            "Show projector": button(
              () => toggleProjectorVisibility(),
              { color: COLOR_AMBER }
            ),
          }),

      // ── Selection-dependent buttons (appear only when a box is selected) ─

      ...(selectedId !== null && {
        "Upload an image": button(
          () => uploadImageForSelected(),
          { color: COLOR_AMBER }
        ),

        // Delete sits below Upload so the destructive action is last
        Delete: button(
          () => deleteSelected(),
          { color: COLOR_RED }
        ),
      }),
    },
    // Re-build panel whenever selection or visibility state changes
    [selectedId, projectorVisible, deleteSelected, uploadImageForSelected, toggleProjectorVisibility]
  );

  return (
    <div style={{ width: "100vw", height: "100vh", background: 'linear-gradient(0deg, rgba(0, 0, 0, 1) 0%, rgba(68, 19, 6, 1) 100%)',
}}>
      {/* Leva floats itself as an overlay in the top-right corner */}
      <Leva collapsed={false} theme={{ sizes: { rootWidth: "280px" } }} />

      <Canvas
        shadows
        camera={{ position: [0, 1.5, 4], fov: 45 }}
        // Clicking the canvas background deselects the current box
        onPointerMissed={() => setSelectedId(null)}
        style={{ width: "100%", height: "100%" }}
      >
        <Scene selectedId={selectedId} onSelect={setSelectedId} />
        <OrbitControls makeDefault />
        <Environment preset="city" />
      </Canvas>
    </div>
  );
}

// The default export wraps AppInner with the Provider
// so that useContext works everywhere inside the tree
export default function App() {
  return (
    <DecalBoxesProvider>
      <AppInner />
    </DecalBoxesProvider>
  );
}