import { StrictMode, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import LoadingScreen from "./components/LoadingScreen.jsx";

const MIN_VISIBLE_MS = 2200;

function Root() {
  const [showLoader, setShowLoader] = useState(true);
  const [appReady, setAppReady] = useState(false);

  useEffect(() => {
    const start = performance.now();
    const finish = () => {
      const elapsed = performance.now() - start;
      const wait = Math.max(0, MIN_VISIBLE_MS - elapsed);
      setTimeout(() => setShowLoader(false), wait);
    };

    if (document.readyState === "complete") {
      finish();
    } else {
      window.addEventListener("load", finish, { once: true });
      return () => window.removeEventListener("load", finish);
    }
  }, []);

  return (
    <>
      <LoadingScreen
        show={showLoader}
        onExitComplete={() => setAppReady(true)}
      />
      {appReady && <App />}
    </>
  );
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Root />
  </StrictMode>,
);
