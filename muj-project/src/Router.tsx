import { Router } from "easy-page-router/react";

import Item from "./pages/Item";
import Items from "./pages/Items";
import NotFound from "./pages/NotFound";

export default function TSORouter() {
    return (
        <Router
            renderPage={({ path }) => {
                if (path.length === 0) return <Items />;
                if (path[0] === "item" && path[1]) return <Item id={path[1]} />;

                return <NotFound />;
            }}
        />
    );
}
