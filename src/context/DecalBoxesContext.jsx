// context/DecalBoxesContext.jsx
// A React Context that acts as a shared "store" so both the App (which owns
// the decalBoxes array) and the CoffeeModel (which reads transforms) can
// communicate without prop-drilling through many layers.

import { createContext, useState, useCallback } from "react";

// The context object – components import this to read/update shared state
export const DecalBoxesContext = createContext(null);

// The Provider wraps the whole app and owns the canonical list of boxes
export function DecalBoxesProvider({ children }) {
  // Each entry: { id, imageUrl, position, rotation, scale }
  const [decalBoxes, setDecalBoxes] = useState([
    {
      id: 1,
      imageUrl: "./1200px-Starbucks_Logo_ab_2011.svg.png",
      position: [0, 0, 0],
      rotation: [0, 0, 0],
      scale:    [1, 1, 1],
    },
  ]);

  // updateBox: merge new transform (or image) data into one box by id
  const updateBox = useCallback((id, patch) => {
    setDecalBoxes((prev) =>
      prev.map((b) => (b.id === id ? { ...b, ...patch } : b))
    );
  }, []);

  // addBox: push a new box with defaults
  const addBox = useCallback(() => {
    setDecalBoxes((prev) => [
      ...prev,
      {
        id: Date.now(),
        imageUrl: "./1200px-Starbucks_Logo_ab_2011.svg.png",
        position: [0, 0, 0],
        rotation: [0, 0, 0],
        scale:    [1, 1, 1],
      },
    ]);
  }, []);

  // removeBox: delete one box by id
  const removeBox = useCallback((id) => {
    setDecalBoxes((prev) => prev.filter((b) => b.id !== id));
  }, []);

  return (
    <DecalBoxesContext.Provider value={{ decalBoxes, updateBox, addBox, removeBox }}>
      {children}
    </DecalBoxesContext.Provider>
  );
}