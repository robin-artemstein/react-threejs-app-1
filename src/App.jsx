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
// Inner component – safely calls useContext because it lives inside Provider
// -------------------------------------------------------------------
function AppInner() {
  const { addBox, removeBox, updateBox } = useContext(DecalBoxesContext);

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
  // useControls rebuilds the panel every time selectedId changes.
  // Spreading conditional keys makes Delete and Upload appear/disappear.
  // -------------------------------------------------------------------
  useControls(
    {
      "New decal": button(() => addBox()),
      ...(selectedId !== null && {
        Delete: button(() => deleteSelected()),
        "Upload an image": button(() => uploadImageForSelected()),
      }),
    },
    [selectedId, deleteSelected, uploadImageForSelected]
  );

  return (
    <div style={{ width: "100vw", height: "100vh", background: "#111827" }}>
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