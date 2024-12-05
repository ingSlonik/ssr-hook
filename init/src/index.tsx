import React from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import { setSSROrigin } from "ssr-hook";

import App from "./App";

const rootElement = document.getElementById("root") as HTMLElement;

if (process.env.NODE_ENV === "development") {
    setSSROrigin("http://localhost:1200"); // development server
    createRoot(rootElement).render(
        <React.StrictMode>
            <App />
        </React.StrictMode>,
    );
} else {
    hydrateRoot(rootElement, <App />);
}
