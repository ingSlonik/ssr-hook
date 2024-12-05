import { Link, useTitle } from "easy-page-router/react";

import { useHeaders, useSSRHook } from "ssr-hook";

export default function Items() {
    const [items, error, isLoading, reload] = useSSRHook<Item[]>(`/api/items`);

    const title = "Items | __NAME__";
    useTitle(title);
    useHeaders({
        title,
        description: "Home page of SSR-hook | SSR-hook",
        image: window.location.origin + "/logo.png",
        canonical: window.location.origin + window.location.pathname,
    });

    return (
        <>
            <h1>Welcome in amazing __NAME__</h1>
            <p>This is just example how SSR-hook works.</p>
            <h2>Server-Site Rendering items:</h2>
            {isLoading && <p>Loading...</p>}
            {error && <p>Error: {error.message}</p>}
            {items && <ul>
                {items?.map(item => <li key={item.id}>
                    <Link to={`/item/${item.id}`}>{item.title}</Link>
                    <p>{item.description}</p>
                </li>)}
            </ul>}
        </>
    );
}