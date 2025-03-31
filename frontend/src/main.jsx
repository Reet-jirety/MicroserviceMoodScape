import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import AuthProvider from "./providers/AuthProvider";
import { ClerkProvider } from "@clerk/clerk-react";
import { PlayerProvider } from "./components/right/music/context/PlayerContext";

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignOutUrl="/">
      <BrowserRouter>
        <AuthProvider>
        <PlayerProvider>
          <App />
          </PlayerProvider>
        </AuthProvider>
      </BrowserRouter>
    </ClerkProvider>
  </StrictMode>
);
