// Placeholder entry point. Phase 1 (Foundation) wraps <App/> in
// ConvexAuthProvider with a ConvexReactClient(import.meta.env.VITE_CONVEX_URL)
// and imports the KMUN design system stylesheet.
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
