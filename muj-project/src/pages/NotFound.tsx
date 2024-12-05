import { Link, useTitle } from "easy-page-router/react";
import { useHeaders } from "ssr-hook";

export default function NotFound() {
    const title = "404 page not found | MůjProject";
    useTitle(title);
    useHeaders({
        title,
        description: title,
        image: window.location.origin + "/logo.png",
        canonical: window.location.origin + window.location.pathname,
    });

    return <>
        <h1>404 page not found</h1>
        <p>
            <Link to="/">Back to home page</Link>
        </p>
    </>;
}
