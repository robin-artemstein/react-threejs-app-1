// main.jsx
// The very first JavaScript file that runs in the browser.
// It mounts the React app onto the <div id="root"> in index.html.

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);